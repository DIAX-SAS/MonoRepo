import React, { useState } from 'react';
import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import {CollapsibleList} from "../core/CollapsibleList"

interface CiclosProps {
  data: GraphData['ciclos'];
}

const Ciclos: React.FC<CiclosProps> = ({ data }) => {
  const [selectedPlcId, setSelectedPlcId] = useState<string | undefined>();

  const infoByPlcId: Record<string, GraphData['ciclos']> = {};

  // Extraer PLC IDs desde los nombres (ej: "Buenas PIMM 4")
  const names: string[] = data?.MultiLine?.map((line) => line.name) ?? [];
  const plcIds = names
    .map((name) => name.match(/PIMM\s*(\d+)/)?.[1]) // extrae número después de "PIMM"
    .filter(Boolean) as string[];

  for (const plcId of plcIds) {
    if (!infoByPlcId[plcId]) {
      infoByPlcId[plcId] = {
        MultiLine: [],
        MultiPie: { name: '', value: 0 },
      };
    }

    infoByPlcId[plcId].MultiLine =
      data?.MultiLine?.filter((line) => line.name.includes(`PIMM ${plcId}`)) ??
      [];

    infoByPlcId[plcId].MultiPie = data?.MultiPie.name.includes(`PIMM ${plcId}`)
      ? data.MultiPie
      : data?.MultiPie.children?.find((node) =>
          node.name.includes(`PIMM ${plcId}`)
        ) ?? {
          name: '',
          value: 0,
        };
  }

  const currentData = selectedPlcId ? infoByPlcId[selectedPlcId] : undefined;

  return (
    <div className="cube_container" id="Ciclos">
      <div className="title_container">
        <h2>Ciclos</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>
      <div className="center full_width rows">
        <div className="columns center full_width">
          <div id="pieCiclosContainer" className="pieContainer">
            <div id="pieCiclos">
              {currentData && (
                <MultiLayerPieChart
                  unit="segundos"
                  data={currentData.MultiPie}
                />
              )}
            </div>
          </div>
          <ul className="legend" id="legendCiclos"></ul>
        </div>
        <div id="lineCiclosContainer" className="lineContainer">
          <div id="lineCiclos">
            {currentData && (
              <>
                <TimeSeriesLineChart
                  labelY="segundos"
                  series={currentData.MultiLine}
                />
                <CollapsibleList data={currentData.MultiPie} unit="segundos" />
              </>
            )}
          </div>
        </div>
        <div id="ciclePlcCont" className="rows center">
          <h2>Maquina</h2>
          <select
            id="ciclePlc"
            onChange={(e) => setSelectedPlcId(e.target.value)}
            defaultValue=""
          >
            <option disabled value="">
              Selecciona una Inyectora
            </option>
            {Object.keys(infoByPlcId).map((plcId) => (
              <option key={plcId} value={plcId}>
                Iny {plcId}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Ciclos;
