from modbus_functions import make_modbus_requests, validate_ip, send_to_iot_core
from datetime import datetime, timezone
import json

# Dictionary of IPs
plc_ips = {
    "PLC_TEST": "192.168.0.152",
}


def process_and_send_data(plc_ips):
    # Obtener la hora actual en UTC
    ahora = datetime.now(timezone.utc)   
    timestamp_en_segundos = ahora.timestamp() 
    timestamp_en_milisegundos = int(timestamp_en_segundos * 1_000)
    for plc_name, ip in plc_ips.items():
        if not validate_ip(ip):
            print(f"Invalid IP address: {ip}")
            return
        plc_data = make_modbus_requests(ip)      
        data_json = json.dumps({"timestamp":timestamp_en_milisegundos,"states":plc_data["states"], "counters":plc_data["counters"]})
        send_to_iot_core(data_json, "PIMMStateTopic")
   


process_and_send_data(plc_ips)