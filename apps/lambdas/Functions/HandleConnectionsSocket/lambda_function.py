import json
import boto3
import requests
import os
from jose import jwt
from jose.exceptions import JWTError


BUCKET_NAME = 'connections-socket'
OBJECT_KEY = 'connections.json'
# Initialize the S3 client
s3_client = boto3.client('s3')

# Cognito Configuration
COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
COGNITO_REGION = os.environ.get('COGNITO_REGION')
COGNITO_POOL_ARN = "arn:aws:cognito-idp:us-east-1:009160061988:userpool/us-east-1_bHo9GIUJg"

# Retrieve the public keys from the Cognito JWKS endpoint
JWKS_URL = f'https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json'
jwks = requests.get(JWKS_URL).json()
keys = {key['kid']: key for key in jwks['keys']}

def get_public_key(kid):
    key = keys.get(kid)
    if not key:
        raise JWTError("Public key not found.")
    return key

def lambda_handler(event, context):
    # Get connection ID from the event
    print("Event: ", event) 
    connection_id = event['requestContext']['connectionId']

    # Extract token from query string parameters
    token = event['queryStringParameters'].get('token')
    
    if not token:
        return {
            'statusCode': 400,
            'body': json.dumps('Token is missing')
        }

    # Validate the token
    try:
        #Decode the token using the public key
        header = jwt.get_unverified_header(token)
        public_key = get_public_key(header['kid'])
        decoded_token = jwt.decode(token, public_key, algorithms=['RS256'], audience=COGNITO_POOL_ARN)
        print("Token valid, decoded payload:", decoded_token)        
    except JWTError as e:
        print(f"Token validation failed: {e}")
        return {
            'statusCode': 401,
            'body': json.dumps('Invalid token')
        }

    # Check if connections object exists in the bucket
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=OBJECT_KEY)
        connections = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        # Object does not exist, create a new list of connections
        connections = []
    except Exception as e:
        print(f"Error accessing S3 bucket: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps('Error accessing S3 bucket')
        }

    # Add the new connection ID to the list
    if connection_id not in connections:
        connections.append(connection_id)
    
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
        'body': json.dumps(f'Connection {connection_id} added')
    }
