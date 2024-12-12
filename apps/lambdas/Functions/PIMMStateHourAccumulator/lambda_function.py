import boto3
import json
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

def lambda_handler(event, context):
    s3 = boto3.client("s3")
    
    source_bucket = "pimmbucket"
    target_bucket = "pimmhourbucket"
    prefix = "IotData/"

    # Configuración de tiempo
    now = datetime.now(timezone.utc)
    start_time = now - timedelta(hours=1)
    
    # Listar y filtrar objetos
    paginator = s3.get_paginator("list_objects_v2")
    pages = paginator.paginate(Bucket=source_bucket, Prefix=prefix)
    
    filtered_objects = []
    for page in pages:
        for obj in page.get("Contents", []):
            try:
                # Extraer timestamp del nombre del archivo
                timestamp_str = obj["Key"].split("/")[1].split(".")[0]
                obj_time = datetime.fromisoformat(timestamp_str).astimezone(timezone.utc)
            except (IndexError, ValueError):
                continue
            
            if start_time <= obj_time <= now:
                filtered_objects.append((obj["Key"], obj_time))            

    # Ordenar por timestamp
    filtered_objects.sort(key=lambda x: x[1])
    unique_datas = []
    prev_states = None

    # Procesar cambios de estado
    for key, _ in filtered_objects:
        response = s3.get_object(Bucket=source_bucket, Key=key)
        data = json.loads(response["Body"].read().decode("utf-8"))
        
        current_states = [s.get("value") for s in data.get("states", [])]
        
        if prev_states is None or current_states != prev_states:
            unique_datas.append(data)
            prev_states = current_states

    # Añadir último objeto si coincide con el tiempo actual (sin milisegundos)
    if filtered_objects:
        last_key, last_time = filtered_objects[-1]
        now_trimmed = now.replace(microsecond=0)
        last_time_trimmed = last_time.replace(microsecond=0)
        
        if last_time_trimmed == now_trimmed:
            response = s3.get_object(Bucket=source_bucket, Key=last_key)
            last_data = json.loads(response["Body"].read().decode("utf-8"))
            
            # Verificar si no está ya incluido
            if not unique_datas or unique_datas[-1]["timestamp"] != last_data["timestamp"]:
                unique_datas.append(last_data)

    # Subir resultados
    for data in unique_datas:
        try:
            output_key = f"IotData/{data['timestamp']}.json"
            s3.put_object(
                Bucket=target_bucket,
                Key=output_key,
                Body=json.dumps(data),
                ContentType="application/json"
            )
        except KeyError:
            continue

    return {
        "statusCode": 200,
        "body": json.dumps(f"Procesados {len(unique_datas)} cambios de estado.")
    }