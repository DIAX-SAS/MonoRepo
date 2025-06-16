"""Lambda function to process and store state changes in DynamoDB.
This function is triggered by an event and processes data from a source DynamoDB table,
storing unique state changes in a target DynamoDB table.
It queries the source table for items within a specified time range,
compares their state values, and writes unique items to the target table.
The function ensures that only unique state changes are stored.
"""
from datetime import datetime,timedelta
from itertools import islice
import json
import boto3
from boto3.dynamodb.conditions import Key

# AWS clients
dynamodb = boto3.resource("dynamodb")

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

def get_partitions(init_time, end_time):
    """Generates a list of epoch days between two timestamps."""

    start = datetime.utcfromtimestamp(init_time / 1000)
    start = start.replace(hour=0, minute=0, second=0, microsecond=0)

    end = datetime.utcfromtimestamp(end_time / 1000)
    end = end.replace(hour=0, minute=0, second=0, microsecond=0)

    total_days = ((end - start).days) + 1

    return [
        int((start + timedelta(days=i)).timestamp() * 1000)
        for i in range(total_days)
    ]

def lambda_handler(event):
    """Lambda function to process and store state changes in DynamoDB."""
    now = int(datetime.utcnow().timestamp() * 1000)

    source_table = dynamodb.Table(event["SOURCE_TABLE_NAME"])
    target_table = dynamodb.Table(event["TARGET_TABLE_NAME"])

    start_time = now - event["MS_CONVERSION"]

    partitions = get_partitions(start_time, now)
    unique_items = []

    for partition in partitions:
        response = source_table.query(
            KeyConditionExpression=Key("epochDay").eq(partition)
            & Key("timestamp").between(start_time, now)
        )
        items = response.get("Items", [])

        if not items:
            continue

        before_item = items[0]
        for item in items:
            for i in range(len(item["states"])):
                if (
                    item["states"][i]["value"]
                    != before_item["states"][i]["value"]
                ):
                    unique_items.append(item)
                    before_item = item
                    break

        if items:
            if not unique_items:
                unique_items.extend([items[0], items[-1]])

            if unique_items[0]["timestamp"] != items[0]["timestamp"]:
                unique_items.insert(0, items[0])

            if unique_items[-1]["timestamp"] != items[-1]["timestamp"]:
                unique_items.append(items[-1])

        for chunk in chunked_iterable(unique_items, 25):
            batch_write_items(target_table, chunk)

    return {
        "statusCode": 200,
        "body": json.dumps(f"Processed {len(unique_items)} state changes."),
    }
