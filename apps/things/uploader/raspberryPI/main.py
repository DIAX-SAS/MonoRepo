"""This module starts the Modbus TCP client and sends data to the IoT Core."""
import asyncio
import json
import os
from datetime import datetime, timezone
from utils.functions import make_modbus_requests, send_multiple_to_iot_core, validate_ip
from utils.functions import extract_epoch_day_from_epoch
from utils.config import plc_ips

async def process_single_plc(ip):
    """Handles connection, data processing, and sending for a single PLC."""   
    if not validate_ip(ip):
        print(f"Invalid IP address: {ip}")
        return
    now = datetime.now(timezone.utc)
    timestamp_in_seconds = now.timestamp()
    timestamp_in_ms = int(timestamp_in_seconds * 1_000)

    plc_data = await make_modbus_requests(ip)
    data_json = json.dumps({
        "epochDay": extract_epoch_day_from_epoch(timestamp_in_ms),
        "timestamp": timestamp_in_ms,
        "plcId": plc_data["PIMMNumber"],
        "states": plc_data["states"],
        "counters": plc_data["counters"],
    })

    return data_json

async def process_and_send_data(plc_addresses):
    """Processes PLC data and sends it to the IoT Core for all PLCs asynchronously."""
    tasks = []
    for _, ip in plc_addresses.items():
        tasks.append(process_single_plc(ip))
    messages = await asyncio.gather(*tasks)
    await send_multiple_to_iot_core(messages, "PIMMStateTopic")

async def main_loop():
    """Main infinite async loop."""
    interval_seconds = int(os.environ.get("in_s", "1"))
    while True:
        asyncio.create_task(process_and_send_data(plc_ips))
        await asyncio.sleep(interval_seconds)

if __name__ == "__main__":
    asyncio.run(main_loop())
