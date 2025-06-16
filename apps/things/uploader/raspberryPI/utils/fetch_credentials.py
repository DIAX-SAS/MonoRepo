"""
This script fetches the certificates from AWS Secrets Manager
and saves them to a specified directory."""
import os
import boto3

secret_names = {
    "AmazonRootCA1.pem": "iot/thing/raspberryPI/AmazonRootCA1.pem",
    "AmazonRootCA3.pem": "iot/thing/raspberryPI/AmazonRootCA3.pem",
    "certificate.pem.crt": "iot/thing/raspberryPI/certificate.pem.crt",
    "private.pem.key": "iot/thing/raspberryPI/private.pem.key",
    "public.pem.key": "iot/thing/raspberryPI/public.pem.key",
}

region = os.getenv("AWS_REGION", "us-east-1")
OUTPUT_DIR = "/certificates"

os.makedirs(OUTPUT_DIR, exist_ok=True)
client = boto3.client("secretsmanager", region_name=region)

for filename, secret_name in secret_names.items():
    response = client.get_secret_value(SecretId=secret_name)
    secret_string = response.get("SecretString")
    print(f"Fetched secret for {filename}")
    with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
        f.write(secret_string)

print(f"Certificates written to {OUTPUT_DIR}")
