import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import {CollapsibleList} from "../core/CollapsibleList"

interface RendimientoProps {
  data: GraphData['rendimiento'];
}
const Rendimiento: React.FC<RendimientoProps> = ({ data }) => {
  return (
    <div className="cube_container" id="Rendimiento">
      <div className="title_container">
        <h2>Rendimiento</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>
      <div className="center full_width rows">
        <ul className="legend" id="legendRendimiento"></ul>
        <div id="lineRendimientoContainer" className="lineContainer">
          <div id="lineRendimiento">
            <TimeSeriesLineChart labelY="inyecciones" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="inyecciones" />
          </div>
        </div>
        <div className="rows center full_width ">
          <div id="pieRendimientoContainer" className="pieContainer margin_gd">
            <div id="pieRendimiento">
              <MultiLayerPieChart unit="inyecciones" data={data?.MultiPie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rendimiento;
