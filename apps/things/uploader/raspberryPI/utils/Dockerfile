FROM arm64v8/alpine:latest

# Install dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash

# Set working directory
WORKDIR /app

# Create and activate a virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Upgrade pip and install required Python packages
RUN pip install --upgrade pip && pip install boto3

# Create folder for certificates
RUN mkdir /certificates

# Copy your Python script
COPY apps/things/uploader/raspberryPI/utils/fetch_credentials.py .

# Set default command
CMD ["python3", "fetch_credentials.py"]
