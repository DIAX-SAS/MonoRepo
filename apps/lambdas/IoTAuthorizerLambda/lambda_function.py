"""AWS IoT Authorizer Lambda Function
This Lambda function is used to authorize devices connecting to AWS IoT Core.
It validates the JWT token provided by the device and generates an access policy.
The function retrieves the signing key from AWS Secrets Manager and uses it to decode the JWT token.
If the token is valid, it generates an allow policy; otherwise, it generates a deny policy.
"""
import json
import base64
import jwt
import boto3



def lambda_handler(event):
    """
    Lambda function handler to authorize devices connecting to AWS IoT Core.
    Args:
        event (dict): The event data passed to the Lambda function.
        context (LambdaContext): The context object provided by AWS Lambda.
    Returns:
        dict: The authorization policy document.
    """
    token = base64.b64decode(
        event.get("protocolData", {}).get("mqtt", {}).get("password")
    )
    if not token:
        raise ValueError("Token no encontrado")
    secrets_manager = boto3.client("secretsmanager")
    secret = secrets_manager.get_secret_value(SecretId="IoTAuth/token")
    signing_key_base64 = json.loads(secret["SecretString"])["signingKey"]
    signing_key = base64.b64decode(
        signing_key_base64
    )
    payload = jwt.decode(
        token, signing_key, algorithms=["HS256"], options={"verify_exp": True}
    )
    return {
        "isAuthenticated": True,
        "principalId": payload.get("device_id", "unknown"),
        "policyDocuments": [
            {
                "Version": "2012-10-17",
                "Statement": [
                    {"Action": "iot:Connect", "Effect": "Allow", "Resource": "*"},
                    {
                        "Action": [
                            "iot:Subscribe",
                            "iot:Receive",
                        ],
                        "Effect": "Allow",
                        "Resource": "*", 
                    },
                ],
            }
        ],
    }




def build_deny_policy(reason):
    """
    Builds a deny policy document.
    Args:
        reason (str): The reason for denying access.
    Returns:
        dict: The deny policy document.
    """
    return {
        "isAuthenticated": False,
        "principalId": reason,
        "policyDocuments": [
            {
                "Version": "2012-10-17",
                "Statement": [{"Action": "iot:*", "Effect": "Deny", "Resource": "*"}],
            }
        ],
    }
