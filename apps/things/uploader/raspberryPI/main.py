from utils.functions import make_modbus_requests, validate_ip, send_to_iot_core
from utils.config import plc_ips
from datetime import datetime, timezone
import json

def process_and_send_data(plc_ips):
    # Obtener la hora actual en UTC
    now = datetime.now(timezone.utc)   
    timestamp_in_seconds = now.timestamp() 
    timestamp_in_ms = int(timestamp_in_seconds * 1_000)
    for plc_name, ip in plc_ips.items():
        if not validate_ip(ip):
            print(f"Invalid IP address: {ip}")
            return
        plc_data = make_modbus_requests(ip)      
        data_json = json.dumps({"timestamp":timestamp_in_ms,"PLCNumber":plc_data["PIMMNumber"],"states":plc_data["states"], "counters":plc_data["counters"]})
        send_to_iot_core(data_json, "PIMMStateTopic")
   


process_and_send_data(plc_ips)