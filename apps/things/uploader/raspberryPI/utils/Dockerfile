FROM arm64v8/alpine:latest

# Install dependencies for AWS CLI and unzip
RUN apk add --no-cache curl unzip groff less bash

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && ./aws/install && \
    rm -rf awscliv2.zip aws

# Install boto3
RUN pip install boto3

# Create work directory
WORKDIR /app

# Create directory for certificates
RUN mkdir /certificates

# Copy the script to retrieve and write the certificates
COPY apps/things/uploader/raspberryPI/utils/fetch_credentials.py .


CMD ["python", "fetch_credentials.py"]

