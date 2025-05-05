import boto3
import os

secret_names = {
    "AmazonRootCA1.pem": "iot/thing/raspberryPI/AmazonRootCA1.pem",
    "AmazonRootCA3.pem": "iot/thing/raspberryPI/AmazonRootCA3.pem",
    "certificate.pem.crt": "iot/thing/raspberryPI/certificate.pem.crt",
    "private.pem.key": "iot/thing/raspberryPI/private.pem.key",
    "public.pem.key": "iot/thing/raspberryPI/public.pem.key",
}

region = os.getenv("AWS_REGION", "us-east-1")
output_dir = "/certificates"

os.makedirs(output_dir, exist_ok=True)
client = boto3.client("secretsmanager", region_name=region)

for filename, secret_name in secret_names.items():
    response = client.get_secret_value(SecretId=secret_name)
    secret_string = response.get("SecretString")
    print(f"Fetched secret for {filename}")
    with open(os.path.join(output_dir, filename), "w") as f:
        f.write(secret_string)

print(f"Certificates written to {output_dir}")
