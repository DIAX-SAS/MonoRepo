"""This file contains the configuration for the Raspberry Pi uploader."""
countersNames = {
"ML0": "Minutos Motor Encendido",
"ML131": "Contador Inyecciones",
"ML135": "Contador Unidades",
"MI100": "KW Motor",
"MI99": "KW Total Maquina",
"MI121": "Minutos Mantto Maquina",
"MI122": "Minutos Mantto Molde",
"MI123": "Minutos Montaje",
"MI124": "Minutos Sin Operario",
"MI125": "Minutos No Programada",
"MI126": "Minutos Fin Produccion",
"MI127": "Minutos Por Material",
"MI128": "Minutos Calidad",
"MI129": "Minutos Fin Turno",
"MI101": "Unidades Defecto Inicio Turno",
"MI102": "Unidades No Conformes",
"MF2": "Debug.Disponibilidad",
"MF3": "Debug.Calidad",
"MF10": "Debug.Rendimiento",
"MF11": "Debug.Eficiencia",
"MF13": "Gramos Cavidad 1",
"MF14": "Gramos Cavidad 2",
"MF15": "Gramos Cavidad 3",
"MF16": "Gramos Cavidad 4",
"MF17": "Gramos Cavidad 5",
"MF18": "Gramos Cavidad 6",
"MF1": "Segundos Ultimo Ciclo Total",
"MF5": "Segundos Ciclo Estandar",
"MF8": "Segundos Ultimo Ciclo Puerta",
"MF9": "Segundos Ultimo Ciclo Maquina",
"MI17": "Grados Celsius Atemperador",
"MI27": "Grados Celsius Tolva",
"MF12": "Gramos Inyeccion",
"MF6": "Segundos Ciclo Estandar +",
"MF7": "Segundos Ciclo Estandar -",
}

statesNames = {
"ML3": "Molde",
"ML1" : "Orden",
"MI19" : "Material",
"MI18" : "Operario",
"ML5" : "Lote",
"MI31": "Numero Inyectora",
"I3": "Estado Motor",
}

variablesNames = {
    "MI31": "Numero Inyectora",
    "ML0": "Minutos Motor Encendido",
    "ML3": "Molde",
    "ML1": "Orden",
    "ML131": "Contador Inyecciones",
    "ML135": "Contador Unidades",
    "MF1": "Segundos Ultimo Ciclo Total",
    "MF5": "Segundos Ciclo Estandar",
    "MF8": "Segundos Ultimo Ciclo Puerta",
    "MF9": "Segundos Ultimo Ciclo Maquina",
    "MI19": "Material",
    "MI18": "Operario",
    "MI17": "Grados Celsius Atemperador",
    "MI27": "Grados Celsius Tolva",
    "MI100": "KW Motor",
    "MI99": "KW Total Maquina",
    "MI121": "Minutos Mantto Maquina",
    "MI122": "Minutos Mantto Molde",
    "MI123": "Minutos Montaje",
    "MI124": "Minutos Sin Operario",
    "MI125": "Minutos No Programada",
    "MI126": "Minutos Fin Produccion",
    "MI127": "Minutos Por Material",
    "MI128": "Minutos Calidad",
    "MI129": "Minutos Fin Turno",
    "MI101": "Unidades Defecto Inicio Turno",
    "MI102": "Unidades No Conformes",
    "MF12": "Gramos Inyeccion",
    "MF13": "Gramos Cavidad 1",
    "MF14": "Gramos Cavidad 2",
    "MF15": "Gramos Cavidad 3",
    "MF16": "Gramos Cavidad 4",
    "MF17": "Gramos Cavidad 5",
    "MF18": "Gramos Cavidad 6",
    "ML5": "Lote",
    "I3": "Estado Motor",
    "MF6": "Segundos Ciclo Estandar +",
    "MF7": "Segundos Ciclo Estandar -",
    "MF2": "Debug.Disponibilidad",
    "MF3": "Debug.Calidad",
    "MF10": "Debug.Rendimiento",
    "MF11": "Debug.Eficiencia"
}

# Dictionary of IPs
plc_ips = {
    "PLC_2": "192.168.0.157",
    "PLC_3": "192.168.0.152",
    "PLC_4": "192.168.0.151",
    "PLC_6": "192.168.0.154",
    "PLC_7": "192.168.0.153",
    "PLC_8": "192.168.0.150",
    "PLC_10": "192.168.0.155",
    "PLC_11": "192.168.0.158",
    "PLC_12": "192.168.0.156",
    "PLC_13": "192.168.0.159"
}
