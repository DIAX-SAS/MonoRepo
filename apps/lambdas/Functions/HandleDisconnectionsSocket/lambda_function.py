import json
import boto3
import os

s3_client = boto3.client('s3')

BUCKET_NAME = 'connections-socket'
OBJECT_KEY = 'connections.json'

def lambda_handler(event, context):
    # Get the connection ID to be removed
    connection_id = event['requestContext']['connectionId']
    
    # Fetch the existing connections from the S3 bucket
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=OBJECT_KEY)
        connections = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        # If no connections object exists, no action is needed
        print(f"No connections found to delete.")
        return {
            'statusCode': 200,
            'body': json.dumps(f'No connections found to delete for {connection_id}')
        }
    except Exception as e:
        print(f"Error accessing S3 bucket: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error accessing S3 bucket')
        }

    # Remove the connection ID from the list if it exists
    if connection_id in connections:
        connections.remove(connection_id)
    else:
        return {
            'statusCode': 404,
            'body': json.dumps(f'Connection {connection_id} not found')
        }

    # Update the connections object in the S3 bucket
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=OBJECT_KEY,
            Body=json.dumps(connections),
            ContentType='application/json'
        )
    except Exception as e:
        print(f"Error updating connections in S3: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error updating connections in S3')
        }

    return {
        'statusCode': 200,
        'body': json.dumps(f'Connection {connection_id} deleted')
    }
