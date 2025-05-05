FROM arm64v8/alpine:latest

# Instala dependencias necesarias
RUN apk add --no-cache \
    curl \
    unzip \
    groff \
    less \
    bash \
    python3 \
    py3-pip

# Instala AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && ./aws/install && \
    rm -rf awscliv2.zip aws

# Directorio de trabajo
WORKDIR /app

# Crear carpeta para certificados
RUN mkdir /certificates

# Copiar script de Python
COPY apps/things/uploader/raspberryPI/utils/fetch_credentials.py .

# Ejecutar el script
CMD ["python3", "fetch_credentials.py"]
