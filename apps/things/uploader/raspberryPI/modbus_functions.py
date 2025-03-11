import ipaddress
from pymodbus.client import ModbusTcpClient
import json
import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import struct
import sys
import os
from config import statesNames,countersNames
import re


def validate_ip(ip):
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False


def sum_hex_and_decimal(hex_address, decimal_value):
    # Convert the hexadecimal address to a decimal integer
    hex_as_decimal = int(hex_address, 16)

    # Sum the hexadecimal (converted to decimal) and the decimal value
    result = hex_as_decimal + decimal_value

    return result


def get_length_registers(position_value, is_32bit=False, include_uplimit=False):
    if include_uplimit:
        position_value = position_value + 1
    if is_32bit:
        length_registers = position_value * 2
    else:
        length_registers = position_value

    return length_registers


def get_system_endianness():
    # Check the byte order of the system
    if sys.byteorder == "little":
        return "little"
    else:
        return "big"


def ensure_length(lst, length):
    # Pad the list with zeros if it's shorter than the expected length
    return lst + [0] * (length - len(lst)) if len(lst) < length else lst[:length]


def make_modbus_requests(ip):
    client = ModbusTcpClient(ip)
    client.connect()

    endianness = get_system_endianness()

    # FIRST SECTION
    offset = sum_hex_and_decimal("0x7000", 0)
    length = get_length_registers(5, True, True)
    ml_data = client.read_holding_registers(
        address=offset, count=length
    ).registers  # ML0, ML1, ML3, ML5
    ml_data = ensure_length(ml_data, length)

    # SECOND SECTION
    offset = sum_hex_and_decimal("0x7000", get_length_registers(131))
    length = get_length_registers(10)

    ml_extra_data = client.read_holding_registers(
        address=offset, count=length
    ).registers  # ML131, ML135
    ml_extra_data = ensure_length(ml_extra_data, length)

    # THIRD SECTION
    offset = sum_hex_and_decimal("0x6000", get_length_registers(3, False))
    length = get_length_registers(1, False)
    i3 = client.read_coils(address=offset, count=length).bits  # I3

    # FOURTH SECTION
    offset = sum_hex_and_decimal("0x0000", get_length_registers(17, False))
    length = get_length_registers(112, False, True)
    mi_data = client.read_holding_registers(address=offset, count=length).registers
    mi_data = ensure_length(mi_data, length)

    # FIFTH SECTION
    offset = sum_hex_and_decimal("0x4000", get_length_registers(1, False))
    length = get_length_registers(18, True, True)
    mf_data = client.read_holding_registers(address=offset, count=length).registers
    mf_data = ensure_length(mf_data, length)

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
    

def calculate_given_variables(toExtract, WhereToExtract):
    newObjects = []
    for key, value in toExtract.items():
        newObjects.append({
            "id": key,
            "name": value,
            "value": WhereToExtract.get(key, None),  
            "valueType": calculate_type(key)     
        })
    return newObjects


def calculate_type(value):
    result = re.sub(r'\d', '', value)#Delete all numbers within the value
    if(result =="MI"):
        return "integer"
    if(result =="ML"):
        return "long"
    if(result =="MF"):
        return "float"
    if(result =="I"):
        return "input"
    return "unknown"

    
def process_32bit_integer(registers, endianness):
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
    return True if coil == 1 else False


def process_32bit_float(registers, endianness):
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


def send_to_iot_core(data, topic):
    cert_dir = os.path.join(os.path.dirname(__file__), "certificates")
    client_id = "009160061988"
    endpoint = "a2hfw5fwhnlmh8-ats.iot.us-east-1.amazonaws.com"
    port = 8883

    # Rutas de los certificados
    root_ca = os.path.join(cert_dir, "AmazonRootCA1.pem")
    cert_file = os.path.join(cert_dir, "certificate.pem.crt")
    private_key = os.path.join(cert_dir, "private.pem.key")

    # Crear el cliente MQTT
    mqtt_client = AWSIoTMQTTClient(client_id)
    mqtt_client.configureEndpoint(endpoint, port)
    mqtt_client.configureCredentials(root_ca, private_key, cert_file)

    # Configuraciones adicionales (opcional)
    mqtt_client.configureAutoReconnectBackoffTime(1, 32, 20)
    mqtt_client.configureOfflinePublishQueueing(-1)  # Cola ilimitada
    mqtt_client.configureDrainingFrequency(2)  # Frecuencia de drenaje de la cola
    mqtt_client.configureConnectDisconnectTimeout(
        5
    )  # Tiempo de espera para conectar/desconectar
    mqtt_client.configureMQTTOperationTimeout(
        3
    )  # Tiempo de espera para operaciones MQTT

    mqtt_client.connect()
    is_sent = mqtt_client.publish(topic, data, 0)  # QoS 1
    mqtt_client.disconnect()

    return is_sent
