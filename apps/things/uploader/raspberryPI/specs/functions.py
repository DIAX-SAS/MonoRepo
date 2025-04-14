import pytest, json
from  apps.things.uploader.raspberryPI.utils.functions import (
    validate_ip,
    sum_hex_and_decimal,
    get_length_registers,
    get_system_endianness,
    ensure_length,
    process_32bit_integer,
    process_32bit_float,
    process_bit_boolean,
    send_to_iot_core,
)


def test_validate_ip():
    assert validate_ip("192.168.0.1") == True
    assert validate_ip("999.999.999.999") == False
    assert validate_ip("invalid_ip") == False


def test_sum_hex_and_decimal():
    assert sum_hex_and_decimal("0x1", 1) == 2
    assert sum_hex_and_decimal("0xA", 5) == 15
    assert sum_hex_and_decimal("0x10", 20) == 36


def test_get_length_registers():
    assert get_length_registers(1, False, False) == 1
    assert get_length_registers(5, True, True) == 12  # (5+1)*2
    assert get_length_registers(10, False, True) == 11  # 10 + 1


def test_get_system_endianness():
    assert get_system_endianness() in ["big", "little"]


def test_ensure_length():
    assert ensure_length([1, 2, 3], 5) == [1, 2, 3, 0, 0]
    assert ensure_length([1, 2, 3], 3) == [1, 2, 3]
    assert ensure_length([1, 2, 3], 2) == [1, 2]


def test_process_32bit_integer():
    assert process_32bit_integer([0x1234, 0x5678], "big") == 0x12345678
    assert process_32bit_integer([0x1234, 0x5678], "little") == 0x56781234


def test_process_bit_boolean():
    assert process_bit_boolean(1) == True
    assert process_bit_boolean(0) == False


def test_process_32bit_float():
    registers = [0x3F80, 0x0000]  # Representing 1.0 in IEEE 754
    assert process_32bit_float(registers, "big") == pytest.approx(1.0, 0.000001)
    assert process_32bit_float(registers, "little") == pytest.approx(1.0, 0.000001)


def test_send_to_iot_core():
    data = {"message": "Hello world from PYTHON"}
    topic = "test/plc"
    assert send_to_iot_core(json.dumps(data), topic) == True
