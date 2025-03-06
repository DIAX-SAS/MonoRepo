import boto3
import json
from datetime import datetime, timedelta, timezone
from boto3.dynamodb.conditions import Key
from itertools import islice
import logging
# AWS clients
dynamodb = boto3.resource("dynamodb")
logger = logging.getLogger()
logger.setLevel(logging.INFO)

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


def check_partition_exists(table, pimm_number):
    """Checks whether a partition exists in a table."""
    response = table.query(
        KeyConditionExpression="PLCNumber = :p",
        ExpressionAttributeValues={":p": pimm_number},
        Limit=1,  # Solo necesitamos saber si existe
    )
    return len(response.get("Items", [])) > 0


def lambda_handler(event, context):

    logger.info(event)
    logger.info(context)
 
    
    # Table names
    SOURCE_TABLE_NAME = event["detail"]["SOURCE_TABLE_NAME"]
    TARGET_TABLE_NAME = event["detail"]["TARGET_TABLE_NAME"]
    MS_CONVERSION = event["detail"]["MS_CONVERSION"]
    TIME_EVENT = int(datetime.fromisoformat(event["time"].replace("Z", "+00:00")).timestamp() * 1000)

    source_table = dynamodb.Table(SOURCE_TABLE_NAME)
    target_table = dynamodb.Table(TARGET_TABLE_NAME)
    # Time configuration
    now = TIME_EVENT  # Convert to milliseconds
    start_time = now - MS_CONVERSION  # 1 minute ago in milliseconds

    pimm_number = 0
    false_count = 0
    partitions = []

    while false_count < 5:
        if check_partition_exists(SOURCE_TABLE_NAME, pimm_number):
            partitions.append(pimm_number)
            false_count = 0  # Reset false counter since we found a valid partition
        else:
            false_count += 1  # Increment false counter

        pimm_number += 1  # Move to the next number
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
