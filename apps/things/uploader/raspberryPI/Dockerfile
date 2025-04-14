# Usar la imagen base de Alpine
FROM alpine:latest

# Establecer el directorio de trabajo
WORKDIR /raspberryPI

# Copiar el contenido del directorio actual en el contenedor
COPY . .

# Instalar Python 3, pip y otros paquetes necesarios
RUN apk update && \
  apk add --no-cache python3 py3-pip bash gcc musl-dev libffi-dev

# Crear y activar un entorno virtual
RUN python3 -m venv venv
ENV PATH="/raspberryPI/venv/bin:$PATH"

# Instalar los paquetes requeridos en el entorno virtual
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

ENV in_s=1

# Crear un script Bash para ejecutar el archivo Python con intervalo controlado por in_s
RUN echo -e '#!/bin/bash\n'\
'while true; do\n'\
'  python /raspberryPI/main.py\n'\
'  sleep "${in_s:-1}"\n'\
'done' > /raspberryPI/runner.sh

# Dar permisos de ejecución al script Bash
RUN chmod +x /raspberryPI/runner.sh

# Configurar el contenedor para ejecutar el script al iniciarse
CMD ["/bin/bash", "/raspberryPI/runner.sh"]

