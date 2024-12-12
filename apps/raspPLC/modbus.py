from modbus_functions import make_modbus_requests, validate_ip, send_to_iot_core
import datetime
import json

# Dictionary of IPs
plc_ips = {
    "PLC_TEST": "192.168.0.152",
}


def process_and_send_data(plc_ips):
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    for plc_name, ip in plc_ips.items():
        if not validate_ip(ip):
            print(f"Invalid IP address: {ip}")
            return
        plc_data = make_modbus_requests(ip)      
        data_json = json.dumps({"timestamp":timestamp,"states":plc_data["states"], "counters":plc_data["counters"]})
        send_to_iot_core(data_json, "PIMMStateTopic")
   


process_and_send_data(plc_ips)