# Usar la imagen base de Alpine
FROM alpine:latest

# Establecer el directorio de trabajo
WORKDIR /modbus

# Copiar el contenido del directorio actual en el contenedor
COPY . .

# Instalar Python 3, pip y otros paquetes necesarios
RUN apk update && \
  apk add --no-cache python3 py3-pip bash gcc musl-dev libffi-dev

# Crear y activar un entorno virtual
RUN python3 -m venv venv
ENV PATH="/modbus/venv/bin:$PATH"

# Instalar los paquetes requeridos en el entorno virtual
RUN pip install --upgrade pip && \
  pip install pytest pymodbus AWSIoTPythonSDK

# Crear un script Bash para ejecutar el archivo Python cada segundo
RUN echo -e '#!/bin/bash\nwhile true; do\n  python /modbus/modbus.py\n  sleep 1\ndone' > /modbus/runner.sh

# Dar permisos de ejecución al script Bash
RUN chmod +x /modbus/runner.sh

# Configurar el contenedor para ejecutar el script al iniciarse
CMD ["/bin/bash", "/modbus/runner.sh"]
