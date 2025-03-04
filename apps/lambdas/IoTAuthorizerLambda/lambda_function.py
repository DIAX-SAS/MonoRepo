import json
import jwt  # PyJWT
import base64
import boto3
from jwt import ExpiredSignatureError, InvalidTokenError
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    try:
        # 1. Validar token en el evento
        token = base64.b64decode(
            event.get("protocolData", {}).get("mqtt", {}).get("password")
        )
        if not token:
            raise ValueError("Token no encontrado")

        # 2. Obtener clave de AWS Secrets Manager
        secrets_manager = boto3.client("secretsmanager")
        secret = secrets_manager.get_secret_value(SecretId="IoTAuth/token")

        # 3. Extraer y decodificar la clave Base64
        signing_key_base64 = json.loads(secret["SecretString"])["signingKey"]
        signing_key = base64.b64decode(
            signing_key_base64
        )  # 🔥 Decodificar clave Base64

        # 4. Decodificar el token con PyJWT
        payload = jwt.decode(
            token, signing_key, algorithms=["HS256"], options={"verify_exp": True}
        )

        # 5. Generar política de acceso
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
                            ],  # Permisos para recibir mensajes
                            "Effect": "Allow",
                            "Resource": "*",  # Reemplaza con tu ARN correcto
                        },
                    ],
                }
            ],
        }

    except ExpiredSignatureError:
        print("Token expirado")
        return build_deny_policy("expired_token")
    except InvalidTokenError:
        print(f"Token inválido: {token}")
        print()
        return build_deny_policy("invalid_token")
    except ClientError as e:
        print(f"Error AWS: {e}")
        return build_deny_policy("aws_error")
    except Exception as e:
        print(f"Error inesperado: {e}")
        return build_deny_policy("internal_error")


def build_deny_policy(reason):
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
