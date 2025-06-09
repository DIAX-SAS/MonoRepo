"""This module contains utility functions for Modbus communication and data processing."""
import ipaddress
import struct
import sys
import os
import re
import asyncio
from datetime import datetime, timezone
from awscrt import mqtt
from awsiot import mqtt_connection_builder
from pymodbus.client import AsyncModbusTcpClient
from utils.config import statesNames,countersNames

def validate_ip(ip):
    """Validate the given IP address."""
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False


def sum_hex_and_decimal(hex_address, decimal_value):
    """This function takes a hexadecimal address and a decimal value,
    converts the hexadecimal address to a decimal integer, and sums it with the decimal value."""
    hex_as_decimal = int(hex_address, 16)
    result = hex_as_decimal + decimal_value
    return result


def get_length_registers(position_value, is_32bit=False, include_uplimit=False):
    """This function calculates the length of registers based on the given position value.
    If is_32bit is True, it multiplies the position value by 2.
    If include_uplimit is True, it adds 1 to the position value."""
    if include_uplimit:
        position_value = position_value + 1
    if is_32bit:
        length_registers = position_value * 2
    else:
        length_registers = position_value

    return length_registers


def get_system_endianness():
    """This function checks the system's endianness and returns 'little' or 'big'."""
    if sys.byteorder == "little":
        return "little"
    return "big"


def ensure_length(lst, length):
    """This function ensures that the list has the specified length.
    If the list is shorter, it pads the list with zeros.
    If the list is longer, it truncates the list to the specified length."""
    return lst + [0] * (length - len(lst)) if len(lst) < length else lst[:length]

def get_holding_registers(client, offset, length):
    """This function reads holding registers from the Modbus slave."""
    response = client.read_holding_registers(address=offset, count=length)
    response = ensure_length(response.registers, length)
    return response.registers


async def read_sections(client):
    """This function reads different sections of registers and coils from the Modbus slave."""
    tasks = []

    # FIRST SECTION
    offset = sum_hex_and_decimal("0x7000", 0)
    length = get_length_registers(5, True, True)
    tasks.append(client.read_holding_registers(address=offset, count=length))

    # SECOND SECTION
    offset = sum_hex_and_decimal("0x7000", get_length_registers(131))
    length = get_length_registers(10)
    tasks.append(client.read_holding_registers(address=offset, count=length))

    # THIRD SECTION
    offset = sum_hex_and_decimal("0x6000", get_length_registers(3, False))
    length = get_length_registers(1, False)
    tasks.append(client.read_coils(address=offset, count=length))

    # FOURTH SECTION
    offset = sum_hex_and_decimal("0x0000", get_length_registers(17, False))
    length = get_length_registers(112, False, True)
    tasks.append(client.read_holding_registers(address=offset, count=length))

    # FIFTH SECTION
    offset = sum_hex_and_decimal("0x4000", get_length_registers(1, False))
    length = get_length_registers(18, True, True)
    tasks.append(client.read_holding_registers(address=offset, count=length))

    # Execute all read requests concurrently
    results = await asyncio.gather(*tasks)

    # Unpack the results
    ml_data = ensure_length(results[0].registers, get_length_registers(5, True, True))
    ml_extra_data = ensure_length(results[1].registers, get_length_registers(10))
    i3 = results[2].bits
    mi_data = ensure_length(results[3].registers, get_length_registers(112, False, True))
    mf_data = ensure_length(results[4].registers, get_length_registers(18, True, True))

    return ml_data, ml_extra_data, i3, mi_data, mf_data


async def make_modbus_requests(ip):
    """This function makes Modbus requests to the PLC and returns the data."""
    client = AsyncModbusTcpClient(ip)
    await client.connect()

    endianness = get_system_endianness()

    [ml_data, ml_extra_data, i3, mi_data, mf_data] = await read_sections(client)

    client.close()

    variables = {
        # INDEX[POSITION * 2 : POSITION * 2 + 2]
        "ML0": process_32bit_integer(ml_data[0:2], endianness),
        "ML1": process_32bit_integer(ml_data[2:4], endianness),
        "ML3": process_32bit_integer(ml_data[6:8], endianness),
        "ML5": process_32bit_integer(ml_data[10:12], endianness),
        # INDEX[ POSITION - 131 )×2 : (POSITION − 131)×2+2 ]
        "ML131": process_32bit_integer(ml_extra_data[0:2], endianness),
        "ML135": process_32bit_integer(ml_extra_data[8:10], endianness),
        # -
        "I3": process_bit_boolean(i3[0]),
        # INDEX = POSITION - 17
        "MI17": mi_data[0],
        "MI18": mi_data[1],
        "MI19": mi_data[2],
        "MI27": mi_data[10],
        "MI31": mi_data[14],
        "MI99": mi_data[82],
        "MI100": mi_data[83],
        "MI101": mi_data[84],
        "MI102": mi_data[85],
        "MI121": mi_data[104],
        "MI122": mi_data[105],
        "MI123": mi_data[106],
        "MI124": mi_data[107],
        "MI125": mi_data[108],
        "MI126": mi_data[109],
        "MI127": mi_data[110],
        "MI128": mi_data[111],
        "MI129": mi_data[112],
        # INDEX[ POSITION * 2 - 2 : POSITION * 2]
        "MF1": process_32bit_float(mf_data[0:2], endianness),
        "MF5": process_32bit_float(mf_data[8:10], endianness),
        "MF6": process_32bit_float(mf_data[10:12], endianness),
        "MF7": process_32bit_float(mf_data[12:14], endianness),
        "MF8": process_32bit_float(mf_data[14:16], endianness),
        "MF9": process_32bit_float(mf_data[16:18], endianness),
        "MF12": process_32bit_float(mf_data[22:24], endianness),
        "MF13": process_32bit_float(mf_data[24:26], endianness),
        "MF14": process_32bit_float(mf_data[26:28], endianness),
        "MF15": process_32bit_float(mf_data[28:30], endianness),
        "MF16": process_32bit_float(mf_data[30:32], endianness),
        "MF17": process_32bit_float(mf_data[32:34], endianness),
        "MF18": process_32bit_float(mf_data[34:36], endianness),
        "MF2": process_32bit_float(mf_data[2:4], endianness),
        "MF3": process_32bit_float(mf_data[4:6], endianness),
        "MF10": process_32bit_float(mf_data[18:20], endianness),
        "MF11": process_32bit_float(mf_data[20:22], endianness),
    }

    return {
        "counters":calculate_given_variables(countersNames, variables),
        "states":calculate_given_variables(statesNames, variables),
        "PIMMNumber":variables.get("MI31")
    }

def calculate_given_variables(to_extract, where_to_extract):
    """This function takes a dictionary of variables to extract and their corresponding values,
    and returns a list of dictionaries with the extracted variables."""
    new_objects = []
    for key, value in to_extract.items():
        new_objects.append({
            "id": key,
            "name": value,
            "value": where_to_extract.get(key, None),  
            "valueType": calculate_type(key)     
        })
    return new_objects


def calculate_type(value):
    """This function takes a string value and returns its type based on the fixed rules."""
    result = re.sub(r'\d', '', value)  # Delete all numbers within the value
    if result == "MI":
        return "integer"
    if result == "ML":
        return "long"
    if result == "MF":
        return "float"
    if result == "I":
        return "input"
    return "unknown"

def process_32bit_integer(registers, endianness):
    """This function processes two 16-bit registers into a single 32-bit integer.
    The endianness parameter determines the byte order."""
    first_register, second_register = registers

    if endianness == "big":
        # Big-endian: higher register comes first
        combined_value = (first_register << 16) | second_register
    elif endianness == "little":
        # Little-endian: lower register comes first
        combined_value = (second_register << 16) | first_register
    else:
        raise ValueError("Endianness must be 'big' or 'little'")

    return combined_value


def process_bit_boolean(coil):
    """This function processes a single bit (coil) and returns its boolean value."""
    return coil == 1


def process_32bit_float(registers, endianness):
    """This function processes two 16-bit registers into a single 32-bit float.
    The endianness parameter determines the byte order."""
    first_register, second_register = registers
    # Combine two 16-bit registers into one 32-bit integer (this represents the float in raw form)
    combined_value = (first_register << 16) | second_register

    if endianness == "little":
        # Swap bytes if the system is little-endian
        combined_value = ((combined_value & 0xFF00FF00) >> 8) | (
            (combined_value & 0x00FF00FF) << 8
        )
        combined_value = ((combined_value >> 16) & 0xFFFF) | (
            (combined_value & 0xFFFF) << 16
        )

    # Convert the 32-bit integer into a float
    float_value = struct.unpack(
        ">f" if endianness == "big" else "<f", struct.pack(">I", combined_value)
    )[0]

    return round(float_value, 7)



async def send_multiple_to_iot_core(messages, topic):
    """Sends multiple messages concurrently to AWS IoT Core
    over a single MQTT connection with QoS 0."""

    cert_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "certificates")
    client_id = "009160061988"
    endpoint = "a2hfw5fwhnlmh8-ats.iot.us-east-1.amazonaws.com"

    root_ca = os.path.join(cert_dir, "AmazonRootCA1.pem")
    cert_file = os.path.join(cert_dir, "certificate.pem.crt")
    private_key = os.path.join(cert_dir, "private.pem.key")

    mqtt_connection = mqtt_connection_builder.mtls_from_path(
        endpoint=endpoint,
        cert_filepath=cert_file,
        pri_key_filepath=private_key,
        ca_filepath=root_ca,
        client_id=client_id,
        clean_session=True,
        keep_alive_secs=30,
    )

    connect_future = mqtt_connection.connect()
    connect_future.result()

    publish_futures = []
    for data in messages:
        future, _packet_id = mqtt_connection.publish(
            topic=topic,
            payload=data,
            qos=mqtt.QoS.AT_MOST_ONCE,  # QoS 0
        )
        publish_futures.append(future)

    await asyncio.gather(*(asyncio.to_thread(f.result) for f in publish_futures))

    disconnect_future = mqtt_connection.disconnect()
    disconnect_future.result()

    return True


def extract_epoch_day_from_epoch(timestamp_in_ms):
    """Extract the epoch day from a timestamp in milliseconds."""
    dt = datetime.fromtimestamp(timestamp_in_ms / 1000, tz=timezone.utc)
    day_start = datetime(dt.year, dt.month, dt.day, tzinfo=timezone.utc)
    return int(day_start.timestamp() * 1000)
