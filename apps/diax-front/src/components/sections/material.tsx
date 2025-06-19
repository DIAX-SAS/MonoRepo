import { useState } from 'react';
import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import {CollapsibleList} from "../core/CollapsibleList"

interface MaterialProps {
  data: GraphData['material'][] | undefined;
}

const Material: React.FC<MaterialProps> = ({ data }) => {
  const [groupBy, setGroupBy] = useState<number>(0); // 0: PIMM, 1: Molde

  const selectedData = data?.[groupBy]; // Asumes solo un grupo; si hay múltiples, aquí puedes cambiar la lógica.

  return (
    <div className="cube_container" id="Material">
      <div className="title_container">
        <h2>Material</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>

      <div className="center full_width rows">
        <ul className="legend" id="legendMaterial"></ul>

        <div id="lineMaterialContainer" className="lineContainer">
          <div id="lineMaterial">
            {selectedData?.MultiLine ? (
              <>
                <TimeSeriesLineChart series={selectedData.MultiLine} labelY="gramos" />
                <CollapsibleList data={selectedData?.MultiPie} unit="gramos" />
              </>
            ) : (
              <p>No hay datos de línea disponibles</p>
            )}
          </div>
        </div>

        <div className="rows center full_width">
          <div id="pieMaterialContainer" className="pieContainer margin_gd">
            <div id="pieMaterial">
              {selectedData?.MultiPie ? (
                <MultiLayerPieChart data={selectedData.MultiPie} unit="gramos" />
              ) : (
                <p>No hay datos de pastel disponibles</p>
              )}
            </div>
          </div>
        </div>

        <div id="MaterialPlcCont" className="rows center">
          <h2>Agrupación</h2>
          <select id="MaterialPlc" value={groupBy} onChange={(e) => setGroupBy(Number(e.target.value))}>
            <option value={0}>PIMM</option>
            <option value={1}>Molde</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Material;
