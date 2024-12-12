import boto3
import json
import os
from botocore.exceptions import ClientError

# Inicializa clientes de AWS
s3 = boto3.client("s3")
api_gateway = boto3.client(
    "apigatewaymanagementapi", endpoint_url=os.getenv("API_GATEWAY_URL")
)


def lambda_handler(event, context):
    try:
        # Extrae detalles del evento S3
        s3_record = event["Records"][0]["s3"]
        s3_bucket = s3_record["bucket"]["name"]
        s3_object_key = s3_record["object"]["key"]

        # Valida el request
        if not s3_bucket or not s3_object_key:
            return {
                "statusCode": 400,
                "body": json.dumps("Missing S3 bucket or object key"),
            }

        # Obtiene las conexiones desde connections.json
        connections_object = s3.get_object(
            Bucket="connections-socket", Key="connections.json"
        )
        connections_content = connections_object["Body"].read().decode("utf-8")
        connections = json.loads(connections_content)

        # Obtiene el contenido del object
        content__object = s3.get_object(Bucket=s3_bucket, Key=s3_object_key)
        content__object = connections_object["Body"].read().decode("utf-8")
        content__object = json.loads(content__object)

        # Envía mensajes a los clientes conectados
        failed_connections = []
        for connection_id in connections:
            try:
                api_gateway.post_to_connection(
                    ConnectionId=connection_id,
                    Data=json.dumps(
                        {
                            "action": "notify",
                            "file_content": content__object,
                        }
                    ),
                )
            except ClientError as e:
                print(f"Error enviando mensaje a la conexión {connection_id}:", e)
                failed_connections.append(connection_id)

        # Respuesta según conexiones fallidas
        if failed_connections:
            return {
                "statusCode": 207,
                "body": json.dumps(
                    {
                        "message": "Algunas conexiones fallaron",
                        "failed_connections": failed_connections,
                    }
                ),
            }

        return {
            "statusCode": 200,
            "body": json.dumps("Mensaje enviado exitosamente a todos los clientes"),
        }
    except Exception as e:
        print("Error inesperado:", e)
        return {"statusCode": 500, "body": json.dumps("Error interno del servidor")}
