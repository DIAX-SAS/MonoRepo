import boto3
import json
from datetime import datetime, timedelta, timezone
from boto3.dynamodb.conditions import Key
from itertools import islice

# AWS clients
dynamodb = boto3.resource("dynamodb")

# Table names
SOURCE_TABLE_NAME = "PIMM"
TARGET_TABLE_NAME = "PIMMMinute"

source_table = dynamodb.Table(SOURCE_TABLE_NAME)
target_table = dynamodb.Table(TARGET_TABLE_NAME)


def chunked_iterable(iterable, size):
    """Splits list into chunks of given size."""
    it = iter(iterable)
    while chunk := list(islice(it, size)):
        yield chunk


def batch_write_items(table, items):
    """Writes items to DynamoDB in batch (max 25 per request)."""
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


def lambda_handler(event, context):
    # Time configuration
    now = int(datetime.now(timezone.utc).timestamp() * 1000)  # Convert to milliseconds
    start_time = now - (60 * 1000)  # 1 minute ago in milliseconds

    partitions = [3]
    unique_items = []

    for partition in partitions:
        # Query latest data
        response = source_table.query(
            KeyConditionExpression=Key("PIMMNumber").eq(partition)
            & Key("timestamp").between(start_time, now)
        )
        items = response.get("Items", [])
        

        if not items:
            continue  # Skip if no data

        # Find state changes
        before_item = items[0]  # First item
        for item in items:
            for i in range(len(item["payload"]["states"])):  # Correct dictionary access
                if (
                    item["payload"]["states"][i]["value"]
                    != before_item["payload"]["states"][i]["value"]
                ):
                    unique_items.append(item)
                    before_item = item  # Update previous item
                    break  # Move to next item

        # Save first and last if not added
        if items:
            # Ensure at least the first and last item are added
            if not unique_items:
                unique_items.extend([items[0], items[-1]])  # Add first & last item

            # Ensure first item is included only once
            if unique_items[0]["timestamp"] != items[0]["timestamp"]:
                unique_items.insert(0, items[0])  # Insert at the beginning

            # Ensure last item is included only once
            if unique_items[-1]["timestamp"] != items[-1]["timestamp"]:
                unique_items.append(items[-1])  # Append at the end

        # Batch write to DynamoDB
        for chunk in chunked_iterable(unique_items, 25):
            batch_write_items(target_table, chunk)

    return {
        "statusCode": 200,
        "body": json.dumps(f"Processed {len(unique_items)} state changes."),
    }
