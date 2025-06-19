import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from "../../app/dashboard-new/dashboard.types";
import {CollapsibleList} from "../core/CollapsibleList"

interface CalidadProps {
  data: GraphData["indicadores"];
}
const Calidad:React.FC<CalidadProps> = ({data}) => {
  return (
    <div className="cube_container" id="Calidad">
      <div className="title_container">
        <h2>Calidad</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>
      <div className="center full_width rows">
        <ul className="legend" id="legendCalidad"></ul>
        <div id="lineCalidadContainer" className="lineContainer">
          <div id="lineCalidad" className="js-plotly-plot">
            <TimeSeriesLineChart labelY="unidades" series={data?.MultiLine}/>
            <CollapsibleList data={data?.MultiPie} unit="unidades"/>
          </div>
        </div>
        <div className="rows center full_width ">
          <div id="pieCalidadContainer" className="pieContainer margin_gd">
            <div id="pieCalidad" className="js-plotly-plot">
              <MultiLayerPieChart unit="unidades" data={data?.MultiPie}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calidad;
