"""This module starts the Modbus TCP client and sends data to the IoT Core."""
from datetime import datetime, timezone
import json
from utils.functions import make_modbus_requests, validate_ip, send_to_iot_core
from utils.functions import extract_epoch_day_from_epoch
from utils.config import plc_ips

def process_and_send_data(plc_addresses):
    """This function processes the PLC data and sends it to the IoT Core."""   
    for _, ip in plc_addresses.items():
        if not validate_ip(ip):
            print(f"Invalid IP address: {ip}")
            return
        now = datetime.now(timezone.utc)
        timestamp_in_seconds = now.timestamp()
        timestamp_in_ms = int(timestamp_in_seconds * 1_000)
        plc_data = make_modbus_requests(ip)
        data_json = json.dumps({ "epochDay": extract_epoch_day_from_epoch(timestamp_in_ms),
                                 "timestamp":timestamp_in_ms,
                                 "plcId":plc_data["PIMMNumber"],
                                 "states":plc_data["states"], 
                                 "counters":plc_data["counters"]})
        send_to_iot_core(data_json, "PIMMStateTopic")

process_and_send_data(plc_ips)
