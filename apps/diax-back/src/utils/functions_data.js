import { dynamic_variables, t } from './variables_global.ts';

//Converting into formats.
export function ParseCSVToArray(csvData) {
  // Split the CSV data into lines
  const lines = csvData.split('\n');

  // Extract the first two lines for headers
  const headers2 = lines[1].split(',').map((header) => header.trim());

  // Array to store the resulting objects
  const result = [];

  // Iterate over the remaining lines for data rows
  for (let i = 2; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim());
    if (row.length !== headers2.length) continue; // Skip rows with incorrect lengths

    // Create a new object for each row
    const variables = {};
    for (let j = 2; j < headers2.length; j++) {
      const key = headers2[j].replace(/["]/g, ''); // Remove quotes from keys
      let value = row[j].replace(/['"]/g, ''); // Remove quotes from values

      // Convert value to number or boolean if applicable
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        value = parseFloat(value);
      } else if (
        value.toLowerCase() === 'true' ||
        value.toLowerCase() === 'false'
      ) {
        value = value.toLowerCase() === 'true';
      }
      variables[key] = value;
    }

    // Push the constructed object to the result array
    result.push({
      name: row[1].replace(/['"]/g, ''), // Remove quotes from name
      timestamp: row[0].replace(/['"]/g, ''), // Remove quotes from timestamp
      variables: variables,
    });
  }

  return result;
}

export function ParseCSVToSimply(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[1].replace(/"/g, '').split(',');

  const result = [];
  const timestampEntry = {};

  for (let i = 2; i < lines.length; i++) {
    const values = lines[i].replace(/"/g, '').split(',');

    const timestamp = values[0].replace(/"/g, '');
    const record = {};

    headers.slice(2).forEach((header, index) => {
      record[header] = isNaN(values[index + 2])
        ? values[index + 2]
        : parseFloat(values[index + 2]);
    });

    if (!timestampEntry[timestamp]) {
      timestampEntry[timestamp] = [];
    }

    timestampEntry[timestamp].push(record);
  }

  // Convert timestampEntry object to an array of objects with the desired structure
  for (const timestamp in timestampEntry) {
    result.push({
      [timestamp]: timestampEntry[timestamp],
    });
  }

  return result;
}

export function ParseCSVToObjects(csvData) {
  // Dividir los datos CSV en líneas
  const lines = csvData.split('\n');

  // Extraer los encabezados de las dos primeras líneas
  const headers2 = lines[1].split(',').map((header) => header.trim());

  // Objeto para almacenar el resultado final
  const result = [];

  // Iterar sobre las líneas de datos restantes
  for (let i = 2; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim());
    if (row.length !== headers2.length) continue; // Omitir filas con longitud incorrecta

    // Crear un objeto para variables
    const variables = {};
    for (let j = 2; j < headers2.length; j++) {
      const key = headers2[j].replace(/"/g, ''); // Eliminar todas las comillas de las claves
      let value = row[j].replace(/"/g, ''); // Eliminar todas las comillas de los valores

      // Convertir valor a número o booleano si corresponde
      if (!isNaN(parseFloat(value)) && isFinite(value)) {
        value = parseFloat(value);
      } else if (
        value.toLowerCase() === 'true' ||
        value.toLowerCase() === 'false'
      ) {
        value = value.toLowerCase() === 'true';
      }

      // Asignar el valor con calidad estándar
      variables[`${key}`] = {
        quality: 'Good+Good+NotLimited',
        value: `${value}`,
      };
    }

    // Crear un objeto PLC con el nombre y las variables
    const plcName = row[1].replace(/"/g, ''); // Eliminar comillas del nombre del PLC
    const timeStamp = row[0].replace(/"/g, ''); // Eliminar comillas del timestamp

    // Verificar si ya existe un objeto con el mismo timestamp
    let existingPLC = result.find((item) => item.timeStamp === timeStamp);
    if (!existingPLC) {
      existingPLC = {
        timeStamp: timeStamp,
        plcs: {},
      };
      result.push(existingPLC);
    }

    // Asignar las variables al PLC correspondiente
    existingPLC.plcs[plcName] = { variables: variables };
  }

  return result;
}

export function JsonToCsv(data, csv_old = false, csv_new = false) {
  data = JSON.parse(data);
  //data =
  if (csv_old) {
    const headers = new Set(['timestamp', 'PLC']);
    const rows = [];

    // Extract headers and rows
    data.forEach((entry) => {
      const timestamp = entry.timeStamp;

      for (const [plcName, plcData] of Object.entries(entry.plcs)) {
        const row = { timestamp, PLC: plcName };

        for (const [variable, details] of Object.entries(plcData.variables)) {
          headers.add(variable); // Add variable names to headers
          row[variable] = details.value; // Add variable values to the row
        }

        rows.push(row);
      }
    });

    // Convert headers and rows to CSV format
    const headerArray = Array.from(headers);
    const csvRows = [headerArray.join(',')];

    rows.forEach((row) => {
      const csvRow = headerArray.map((header) => row[header] ?? '').join(',');
      csvRows.push(csvRow);
    });

    return csvRows.join('\n');
  }

  if (csv_new) {
    const flattenData = (data) => {
      const flattened = [];
      data.forEach((entry) => {
        for (const [timestamp, readings] of Object.entries(entry)) {
          readings.forEach((reading) => {
            flattened.push({ timestamp, ...reading });
          });
        }
      });
      return flattened;
    };

    // Función para convertir a CSV
    const convertToCSV = (data) => {
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')]; // Encabezados

      data.forEach((row) => {
        const values = headers.map((header) =>
          JSON.stringify(row[header] || 0)
        );
        csvRows.push(values.join(','));
      });

      return csvRows.join('\n');
    };
    data = flattenData(data);
    const csvData = convertToCSV(data);

    return csvData;
  }
}

//OFFSETS
export function OffsetsSlices(
  inputs,
  with_offset = false,
  with_offset_new = false
) {
  if (with_offset) {
    Object.keys(inputs[0].plcs).forEach((plcId) => {
      //Devuelve un array de keys : string de los nombres de la inyectora.
      Object.keys(dynamic_variables).forEach((offset) => {
        dynamic_variables[offset] = 0;
      }); //Inicializa todas las variables que son dependientes a las variables de estado en 0
      inputs.forEach((input, i) => {
        // Recorrerá cada elemento dentro del array
        const plcVars = input.plcs[plcId].variables; // Retorna las variables de la inyectora en cuestión.
        Object.keys(dynamic_variables).forEach((offsetKey) => {
          const currVar = Number(plcVars[offsetKey].value); //Tiene el valor de la variable del offset dentro del objeto de timestamp dado una inyectora
          // flatten
          if (i == 0) dynamic_variables[offsetKey] -= currVar; //Al primer variable de la inyectora en cuestión del timestamp toma la variable primera de dynamic variables y la pone en 0.
          // offset
          if (i > 0) {
            const lastVar = Number(
              inputs[i - 1].plcs[plcId].variables[offsetKey].value
            ); // Toma el previous valor de la variable del objeto variables del la inyectora en cuestion del objeto timestamp en cuestion
            if (currVar < lastVar - dynamic_variables[offsetKey])
              // si el valor de la variable de synamics svariables en cuestion del objeto de variables de la inyectora en cuestión y del objeto de timestamp en cuestión
              dynamic_variables[offsetKey] +=
                lastVar - dynamic_variables[offsetKey] - currVar;
          } // Solo aplica para aquellos objetos de variables diferentes al objeto del primer timestamp.
          plcVars[offsetKey].value = currVar + dynamic_variables[offsetKey];
        }); // Retorna un array de keys : string del objecto de los offsets y los recorre.
      });
    });
  }

  if (with_offset_new) {
    const start_timestamp = Object.keys(inputs[0])[0];
    const inyectoras = inputs[0][start_timestamp].reduce((array, inyectora) => {
      array.push(inyectora.MI31);
      return array; // Ensure to return the array for the next iteration
    }, []);

    inyectoras.forEach((inyectoraNumber) => {
      Object.keys(dynamic_variables).forEach((offset) => {
        dynamic_variables[offset] = 0;
      });
      inputs.forEach((timeStamp, i) => {
        let variables;

        let prevKey;
        const key = Object.keys(inputs[i])[0];

        for (let j = 0; j < inputs[i][key].length; j++) {
          if (inputs[i][key][j].MI31 === inyectoraNumber) {
            variables = inputs[i][key][j];
            break;
          }
        }
        Object.keys(dynamic_variables).forEach((dynamic_variable) => {
          const currVar = Number(variables[dynamic_variable]); //Tiene el valor de la variable del offset dentro del objeto de timestamp dado una inyectora
          // flatten
          if (i == 0) dynamic_variables[dynamic_variable] -= currVar; //Al primer variable de la inyectora en cuestión del timestamp toma la variable primera de dynamic variables y la pone en 0.
          // offset
          if (i > 0) {
            prevKey = Object.keys(inputs[i - 1])[0];
            const lastVar = Number(
              inputs[i - 1][prevKey]
                .filter((inyectora) => inyectora.MI31 === inyectoraNumber) // Filter objects matching the condition
                .map((inyectora) => inyectora[dynamic_variable]) // Extract the desired property
                .reduce((_, value) => value, null) // Return the final value (or null if empty)
            ); // Toma el previous valor de la variable del objeto variables del la inyectora en cuestion del objeto timestamp en cuestion
            if (currVar < lastVar - dynamic_variables[dynamic_variable])
              // si el valor de la variable de synamics svariables en cuestion del objeto de variables de la inyectora en cuestión y del objeto de timestamp en cuestión
              dynamic_variables[dynamic_variable] +=
                lastVar - dynamic_variables[dynamic_variable] - currVar;
          } // Solo aplica para aquellos objetos de variables diferentes al objeto del primer timestamp.
          variables[dynamic_variable] =
            currVar + dynamic_variables[dynamic_variable];
        });
      });
    });
  }

  return inputs;
}

//Filters
export function FilterSettings(objects, settings) {
  const newObjects = objects.map((object) => {
    const key = Object.keys(object)[0];
    const plcsData = object[key];

    // Filtramos los datos de los PLCs según las configuraciones de los filtros
    const filteredPlcsData = plcsData.filter((plcData) => {
      // Comprobamos si todos los valores coinciden con los filtros
      const matchesMachine = settings.machine.some(
        (item) =>
          item.parent === Number(plcData.MI31) &&
          item.value === Number(plcData.MI31)
      );
      const matchesWorker = settings.worker.some(
        (item) =>
          item.parent === Number(plcData.MI31) &&
          item.value === Number(plcData.MI18)
      );
      const matchesOrder = settings.order.some(
        (item) =>
          item.parent === Number(plcData.MI31) &&
          item.value === Number(plcData.ML1)
      );
      const matchesLot = settings.lot.some(
        (item) =>
          item.parent === Number(plcData.MI31) &&
          item.value === Number(plcData.ML5)
      );
      const matchesMold = settings.mold.some(
        (item) =>
          item.parent === Number(plcData.MI31) &&
          item.value === Number(plcData.ML3)
      );
      const matchesMaterial = settings.material.some(
        (item) =>
          item.parent === Number(plcData.MI31) &&
          item.value === Number(plcData.MI19)
      );

      // Si algún filtro no coincide, el dato será eliminado
      return (
        matchesMachine ||
        matchesWorker ||
        matchesOrder ||
        matchesLot ||
        matchesMold ||
        matchesMaterial
      );
    });

    // Devolvemos el objeto con los datos filtrados
    return { [key]: filteredPlcsData };
  });
  return newObjects;
}

//DATA FOR DASHBOARD
export function CalculateFactorsOee(inputs) {
  

  inputs.forEach((input) => {
    const key = Object.keys(input)[0];
    const plcs = input[key];
    const _startD = new Date(Object.keys(inputs[0])[0]);
    const _endD = new Date(Object.keys(inputs[inputs.length - 1])[0]);
    const diffMs = _endD - _startD;

    // Variables acumulativas
    let _buenas = 0,
      _arranque = 0,
      _rechazos = 0;
    let _producidasPerf = 0,
      _ineficiencias = 0;
    let _producidasAvail = 0,
      _paradas = 0,
      _montajes = 0;
    let _calidades = 0,
      _materiales = 0,
      _sinoperarios = 0;
    let _moldes = 0,
      _maquinas = 0,
      _noProg=0;
      

    plcs.forEach((plc) => {
      // Quality calculations
      const unidades = Number(plc[t['Contador Unidades']]);
      const defectoInicioTurno = Number(
        plc[t['Unidades Defecto Inicio Turno']]
      );
      const noConformes = Number(plc[t['Unidades No Conformes']]);
      const buenas = unidades - defectoInicioTurno - noConformes;

      charts.quality.line_chart.lines['B.'.concat(plc.MI31)].ydata.push(buenas);
      charts.quality.line_chart.lines['A.'.concat(plc.MI31)].ydata.push(
        defectoInicioTurno
      );
      charts.quality.line_chart.lines['R.'.concat(plc.MI31)].ydata.push(
        noConformes
      );

      _buenas += buenas;
      _arranque += defectoInicioTurno;
      _rechazos += noConformes;

      // Performance calculations
      const inyecciones = Number(plc[t['Contador Inyecciones']]);
      const segundosCicloEstandar = Number(plc[t['Segundos Ciclo Estandar']]);
      const minutosMotorEncendido =
        Number(plc[t['Minutos Motor Encendido']]) * 60;

      let _inefs = minutosMotorEncendido / segundosCicloEstandar - inyecciones;
      _inefs = Math.max(0, _inefs);

      charts.performance.line_chart.lines['P.'.concat(plc.MI31)].ydata.push(
        inyecciones
      );
      charts.performance.line_chart.lines['I.'.concat(plc.MI31)].ydata.push(
        _inefs
      );

      _producidasPerf += inyecciones;
      _ineficiencias += _inefs;

      // Availability calculations
      const montaje = Number(plc[t['Minutos Montaje']]);
      const calidad = Number(plc[t['Minutos Calidad']]);
      const material = Number(plc[t['Minutos Por Material']]);
      const abandono = Number(plc[t['Minutos Sin Operario']]);
      const molde = Number(plc[t['Minutos Mantto Molde']]);
      const maquina = Number(plc[t['Minutos Mantto Maquina']]);
      const noProg = Number(plc[t['Minutos No Programada']]);

      const prod = Math.floor(
        Math.round(diffMs / 1000 / 60) -
          noProg -
          (maquina + molde + abandono + material + calidad + montaje)
      );

      charts.availability.line_chart.lines['P.'.concat(plc.MI31)].ydata.push(
        prod
      );
      charts.availability.line_chart.lines['MJ.'.concat(plc.MI31)].ydata.push(
        montaje
      );
      charts.availability.line_chart.lines['CA.'.concat(plc.MI31)].ydata.push(
        calidad
      );
      charts.availability.line_chart.lines['MA.'.concat(plc.MI31)].ydata.push(
        material
      );
      charts.availability.line_chart.lines['SO.'.concat(plc.MI31)].ydata.push(
        abandono
      );
      charts.availability.line_chart.lines['MD.'.concat(plc.MI31)].ydata.push(
        molde
      );
      charts.availability.line_chart.lines['MQ.'.concat(plc.MI31)].ydata.push(
        maquina
      );
      charts.availability.line_chart.lines['NP.'.concat(plc.MI31)].ydata.push(
        noProg
      );

      _producidasAvail += prod;
      _paradas += maquina + molde + abandono + material + calidad + montaje;
      _montajes += montaje;
      _calidades += calidad;
      _materiales += material;
      _sinoperarios += abandono;
      _moldes += molde;
      _maquinas += maquina;
      _noProg += noProg;
    });

    // Push aggregated values for each category
    charts.quality.line_chart.lines['Buenas'].ydata.push(_buenas);
    charts.quality.line_chart.lines['Arranque'].ydata.push(_arranque);
    charts.quality.line_chart.lines['Rechazos'].ydata.push(_rechazos);
    charts.quality.line_chart.lines['Malas'].ydata.push(_arranque + _rechazos);
    charts.quality.line_chart.lines['Produccion'].ydata.push(
      _buenas + _arranque + _rechazos
    );

    charts.performance.line_chart.lines['Producido'].ydata.push(
      _producidasPerf
    );
    charts.performance.line_chart.lines['Ineficiencias'].ydata.push(
      _ineficiencias
    );

    charts.availability.line_chart.lines['Producidas'].ydata.push(
      _producidasAvail
    );
    charts.availability.line_chart.lines['Paradas'].ydata.push(_paradas);
    charts.availability.line_chart.lines['Maquina'].ydata.push(_maquinas);
    charts.availability.line_chart.lines['Molde'].ydata.push(_moldes);
    charts.availability.line_chart.lines['SinOperario'].ydata.push(
      _sinoperarios
    );
    charts.availability.line_chart.lines['Material'].ydata.push(_materiales);
    charts.availability.line_chart.lines['Calidad'].ydata.push(_calidades);
    charts.availability.line_chart.lines['Montaje'].ydata.push(_montajes);
  });

  const getLastValues = (lines, prefixes) => {
    return Object.keys(lines)
      .filter((key) => prefixes.some((prefix) => key.startsWith(prefix)))
      .reduce((acc, key) => {
        acc[key] = lines[key].ydata[lines[key].ydata.length - 1];
        return acc;
      }, {});
  };

  charts.quality.pie_chart = {
    produccion: {
      buenas: getLastValues(charts.quality.line_chart.lines, ['B.']),
      malas: {
        arranque: getLastValues(charts.quality.line_chart.lines, ['A.']),
        rechazo: getLastValues(charts.quality.line_chart.lines, ['R.']),
      },
    },
  };

  charts.performance.pie_chart = {
    capacidad: {
      producido: getLastValues(charts.performance.line_chart.lines, ['P.']),
      ineficiencias: getLastValues(charts.performance.line_chart.lines, ['I.']),
    },
  };

  charts.availability.pie_chart = {
    disponibilidad: {
      productivo: getLastValues(charts.availability.line_chart.lines, ['P.']),
      paradas: {
        maquina: getLastValues(charts.availability.line_chart.lines, ['MQ.']),
        sinOperario: getLastValues(charts.quality.line_chart.lines, ['SO.']),
        calidad: getLastValues(charts.availability.line_chart.lines, ['CA.']),
        montaje: getLastValues(charts.quality.line_chart.lines, ['MJ.']),
        molde: getLastValues(charts.availability.line_chart.lines, ['MD.']),
        material: getLastValues(charts.availability.line_chart.lines, ['MA.']),
      },
    },
  };

  return [
    {
      title: 'quality',
      charts: {
        line_chart: charts.quality.line_chart,
        pie_chart: charts.quality.pie_chart,
      },
    },
    {
      title: 'performance',
      charts: {
        line_chart: charts.performance.line_chart,
        pie_chart: charts.performance.pie_chart,
      },
    },
    {
      title: 'availability',
      charts: {
        line_chart: charts.availability.line_chart,
        pie_chart: charts.availability.pie_chart,
      },
    },
  ];
}

export function CalculateMountingData(inputs) {
  
  if (inputs.length == 0) return [];
  const montajes = [];

  const index = inputs.length - 1;
  const key = Object.keys(inputs[index])[0];
  const plcs = inputs[index][key];
  plcs.forEach((plc) => {
    let _col = new String(plc[t['Molde']]);
    if (_col.length != 4 && _col != '0') {
      _col = _col.substring(_col.length - 6, _col.length - 2);
    }
    const orden = plc[t['Orden']];
    const operario = plc[t['Operario']];
    const lote = plc[t['Lote']];
    const material = plc[t['Material']];

    const montaje = {
      numberMachine: plc['MI31'],
      order: orden,
      worker: operario,
      lot: lote,
      mold: Number(_col),
      material: material,
    };
    montajes.push(montaje);
  });

  // Lógica para calcular mountingData
  return montajes;
}

export function CalculateEnergyData(inputs) {
  
  if (inputs.length == 0) return [];
  const charts = {
    line_chart: {
      xaxis: [],
      lines: new Proxy(
        {},
        {
          get(target, prop) {
            // Si la propiedad no existe, la creamos
            if (!(prop in target)) {
              target[prop] = { ydata: [] }; // Inicializamos el objeto con ydata
            }
            return target[prop];
          },
        }
      ),
    },
    bar_chart: {
      labels: [],
      firstValues: [],
      secondValues: [],
    },
  };

  inputs.forEach((input, index) => {
    const key = Object.keys(inputs[index])[0];
    charts.line_chart.xaxis.push(key);
  });

  inputs.forEach((input, index) => {
    const key = Object.keys(inputs[index])[0];
    const plcs = inputs[index][key];
    let _motor = 0;
    let _maquina = 0;
    plcs.forEach((plc) => {
      const motor = Number(plc[t['KW Motor']]);
      const maquina = Number(plc[t['KW Total Maquina']]);

      charts.line_chart.lines['MOTOR.'.concat(plc['MI31'])].ydata.push(motor);
      charts.line_chart.lines['MAQUINA.'.concat(plc['MI31'])].ydata.push(
        maquina
      );

      _motor += motor;
      _maquina += maquina;
    });

    charts.line_chart.lines['MOTOR'].ydata.push(_motor);
    charts.line_chart.lines['MAQUINA'].ydata.push(_maquina);
    charts.line_chart.lines['TOTAL'].ydata.push(_motor + _maquina);
  });

  const key = Object.keys(inputs[inputs.length - 1])[0];
  const plcs = inputs[inputs.length - 1][key];

  charts.bar_chart.labels = plcs.map((plc) => {
    return 'Inyectora'.concat(plc.MI31);
  });

  charts.bar_chart.firstValues = Object.keys(charts.line_chart.lines)
    .filter((key) => {
      return key.startsWith('MOTOR.');
    })
    .reduce((acc, key) => {
      acc.push(
        charts.line_chart.lines[key].ydata[
          charts.line_chart.lines[key].ydata.length - 1
        ]
      );
      return acc;
    }, []); //MOTOR

  charts.bar_chart.secondValues = Object.keys(charts.line_chart.lines)
    .filter((key) => {
      return key.startsWith('MAQUINA.');
    })
    .reduce((acc, key) => {
      acc.push(
        charts.line_chart.lines[key].ydata[
          charts.line_chart.lines[key].ydata.length - 1
        ]
      );
      return acc;
    }, []); //MAQUINA

  // Lógica para calcular energyData
  return {
    charts: {
      line_chart: charts.line_chart,
      bar_chart: charts.bar_chart,
    },
  };
}

export function CalculateMaterialData(inputs) {
  
  if (inputs.length == 0) return [];
  const charts = {
    maquina: {
      line_chart: {
        xaxis: [],
        lines: new Proxy(
          {},
          {
            get(target, prop) {
              // Si la propiedad no existe, la creamos
              if (!(prop in target)) {
                target[prop] = { ydata: [] }; // Inicializamos el objeto con ydata
              }
              return target[prop];
            },
          }
        ),
      },
      pie_chart: {
        Total: {}, // Inicialización vacía para `Total`
      },
    },
    mold: {
      line_chart: {
        xaxis: [],
        lines: new Proxy(
          {},
          {
            get(target, prop) {
              // Si la propiedad no existe, la creamos
              if (!(prop in target)) {
                target[prop] = { ydata: [] }; // Inicializamos el objeto con ydata
              }
              return target[prop];
            },
          }
        ),
      },
      pie_chart: {
        Total: {}, // Inicialización vacía para `Total`
      },
    },
  };

  inputs.forEach((input, index) => {
    const key = Object.keys(inputs[index])[0];
    const plcs = inputs[index][key];
    charts.maquina.line_chart.xaxis.push(key);
    charts.mold.line_chart.xaxis.push(key);
    plcs.forEach((plc) => {
      const gramosgeneral = Number(plc[t['Gramos Inyeccion']]);
      const cavidad1 = Number(plc[t['Gramos Cavidad 1']]);
      const cavidad2 = Number(plc[t['Gramos Cavidad 2']]);
      const cavidad3 = Number(plc[t['Gramos Cavidad 3']]);
      const cavidad4 = Number(plc[t['Gramos Cavidad 4']]);
      const cavidad5 = Number(plc[t['Gramos Cavidad 5']]);
      const cavidad6 = Number(plc[t['Gramos Cavidad 6']]);

      charts.maquina.line_chart.lines['GENERAL.'.concat(plc.MI31)].ydata.push(
        gramosgeneral
      );

      if (cavidad1 != 0)
        charts.maquina.line_chart.lines['Cav1.'.concat(plc.MI31)].ydata.push(
          cavidad1
        );
      if (cavidad2 != 0)
        charts.maquina.line_chart.lines['Cav2.'.concat(plc.MI31)].ydata.push(
          cavidad2
        );
      if (cavidad3 != 0)
        charts.maquina.line_chart.lines['Cav3.'.concat(plc.MI31)].ydata.push(
          cavidad3
        );
      if (cavidad4 != 0)
        charts.maquina.line_chart.lines['Cav4.'.concat(plc.MI31)].ydata.push(
          cavidad4
        );
      if (cavidad5 != 0)
        charts.maquina.line_chart.lines['Cav5.'.concat(plc.MI31)].ydata.push(
          cavidad5
        );
      if (cavidad6 != 0)
        charts.maquina.line_chart.lines['Cav6.'.concat(plc.MI31)].ydata.push(
          cavidad6
        );
    });
  });

  //#####

  //####2

  inputs.forEach((input, index) => {
    const key = Object.keys(inputs[index])[0];
    const plcs = inputs[index][key];
    const moldes = {};
    plcs.forEach((plc) => {
      const gramosgeneral = Number(plc[t['Gramos Inyeccion']]);
      const cavidad1 = Number(plc[t['Gramos Cavidad 1']]);
      const cavidad2 = Number(plc[t['Gramos Cavidad 2']]);
      const cavidad3 = Number(plc[t['Gramos Cavidad 3']]);
      const cavidad4 = Number(plc[t['Gramos Cavidad 4']]);
      const cavidad5 = Number(plc[t['Gramos Cavidad 5']]);
      const cavidad6 = Number(plc[t['Gramos Cavidad 6']]);
      const molde = Number(plc[t['Molde']]);

      if (!moldes[molde]) {
        moldes[molde] = {
          acc_cav1: 0,
          acc_cav2: 0,
          acc_cav3: 0,
          acc_cav4: 0,
          acc_cav5: 0,
          acc_cav6: 0,
          acc_gen: 0,
        };
      }

      moldes[molde].acc_cav1 += cavidad1;
      moldes[molde].acc_cav2 += cavidad2;
      moldes[molde].acc_cav3 += cavidad3;
      moldes[molde].acc_cav4 += cavidad4;
      moldes[molde].acc_cav5 += cavidad5;
      moldes[molde].acc_cav6 += cavidad6;
      moldes[molde].acc_gen += gramosgeneral;
    });

    Object.keys(moldes).forEach((key) => {
      charts.mold.line_chart.lines['Cav1.'.concat(key)].ydata.push(
        moldes[key].acc_cav1
      );
      charts.mold.line_chart.lines['Cav2.'.concat(key)].ydata.push(
        moldes[key].acc_cav2
      );
      charts.mold.line_chart.lines['Cav3.'.concat(key)].ydata.push(
        moldes[key].acc_cav3
      );
      charts.mold.line_chart.lines['Cav4.'.concat(key)].ydata.push(
        moldes[key].acc_cav4
      );
      charts.mold.line_chart.lines['Cav5.'.concat(key)].ydata.push(
        moldes[key].acc_cav5
      );
      charts.mold.line_chart.lines['Cav6.'.concat(key)].ydata.push(
        moldes[key].acc_cav6
      );
      charts.mold.line_chart.lines['GENERAL.'.concat(key)].ydata.push(
        moldes[key].acc_gen
      );
    });
  });

  // Función auxiliar para generar pie_chart
  const generatePieChart = (lines) => {
    return {
      Total: Object.keys(lines)
        .filter((key) => key.startsWith('GENERAL.'))
        .reduce((acc, generalKey) => {
          const id = generalKey.split('.')[1]; // Extraer ID de GENERAL.x
          acc[generalKey] = Object.keys(lines)
            .filter((key) => key.startsWith('Cav') && key.endsWith(`.${id}`))
            .reduce((cavAcc, cavKey) => {
              cavAcc[cavKey] =
                lines[cavKey]?.ydata[lines[cavKey]?.ydata.length - 1];
              return cavAcc;
            }, {});
          return acc;
        }, {}),
    };
  };

  // Asignar los pie_charts optimizados
  charts.maquina.pie_chart = generatePieChart(charts.maquina.line_chart.lines);
  charts.mold.pie_chart = generatePieChart(charts.mold.line_chart.lines);

  //####2

  return {
    charts: {
      mold: {
        pie_chart: charts.mold.pie_chart,
        line_chart: charts.mold.line_chart,
      },
      machine: {
        pie_chart: charts.maquina.pie_chart,
        line_chart: charts.maquina.line_chart,
      },
    },
  };
}

export function CalculateCycleData(inputs) {
  
  if (inputs.length == 0) return [];
  const charts = {
    line_chart: {
      xaxis: [],
      lines: new Proxy(
        {},
        {
          get(target, prop) {
            // Si la propiedad no existe, la creamos
            if (!(prop in target)) {
              target[prop] = { ydata: [] }; // Inicializamos el objeto con ydata
            }
            return target[prop];
          },
        }
      ),
    },
    pie_chart: {},
  };

  // Lógica para calcular cycleData

  const cyclesIny = [];

  inputs.forEach((input) => {
    const key = Object.keys(input)[0]; // Obtener la clave
    const plcs = input[key];
    charts.line_chart.xaxis.push(key); // Agregar al eje X

    plcs.forEach((plc) => {
      // Calcular valores
      const puerta = Number(plc[t['Segundos Ultimo Ciclo Puerta']]);
      const totalMP = Number(plc[t['Segundos Ultimo Ciclo Total']]);
      const min = Number(plc[t['Segundos Ciclo Estandar -']]);
      const max = Number(plc[t['Segundos Ciclo Estandar +']]);
      const mean = Number(plc[t['Segundos Ciclo Estandar']]);
      const maquina = totalMP - puerta;

      // Actualizar datos del gráfico
      const metrics = { min, max, mean, totalMP, maquina, puerta };
      Object.entries(metrics).forEach(([metricName, value]) => {
        const lineKey = `${metricName}.${plc.MI31}`;
        charts.line_chart.lines[lineKey].ydata.push(value);
      });
    });
  });

  // Pie chart para el último PLC de este input

  const key = Object.keys(inputs[0])[0]; // Obtener la clave
  const plcs = inputs[0][key];

  // Iteramos sobre los PLCs
  plcs.forEach((plc) => {
    const idPlc = plc.MI31;

    // Construir el gráfico de pastel directamente sin redundancia
    const puertaKey = `puerta.${idPlc}`;
    const maquinaKey = `maquina.${idPlc}`;
    const minKey = `min.${idPlc}`;
    const maxKey = `max.${idPlc}`;
    const meanKey = `mean.${idPlc}`;
    const totalMPKey = `totalMP.${idPlc}`;

    const puertaData = charts.line_chart.lines[puertaKey].ydata.slice(-1)[0];
    const maquinaData = charts.line_chart.lines[maquinaKey].ydata.slice(-1)[0];

    charts.pie_chart = {
      puerta: puertaData,
      maquina: maquinaData,
    };

    // Filtrar y extraer solo las líneas relevantes de manera más eficiente
    const relevantLines = {
      [puertaKey]: charts.line_chart.lines[puertaKey],
      [maquinaKey]: charts.line_chart.lines[maquinaKey],
      [minKey]: charts.line_chart.lines[minKey],
      [maxKey]: charts.line_chart.lines[maxKey],
      [meanKey]: charts.line_chart.lines[meanKey],
      [totalMPKey]: charts.line_chart.lines[totalMPKey],
    };

    // Clonar charts solo una vez después de ajustar las líneas
    const charts2 = JSON.parse(JSON.stringify(charts));
    charts2.line_chart.lines = relevantLines;

    // Agregar el objeto al arreglo cyclesIny
    cyclesIny.push({ idMachine: idPlc, charts: charts2 });
  });

  return cyclesIny;
}