FROM arm64v8/alpine:latest

WORKDIR /raspberryPI
ENV in_s=1
COPY . .
RUN apk update && \
  apk add --no-cache python3 py3-pip bash gcc musl-dev libffi-dev

# Crear y activar un entorno virtual
RUN python3 -m venv venv
ENV PATH="/raspberryPI/venv/bin:$PATH"

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["python", "main.py"]

