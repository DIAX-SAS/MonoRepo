import { MultiLayerPieChart, TimeSeriesLineChart, StackedBarChart } from '../graphs/index';
import type { GraphData } from "../../app/dashboard-new/dashboard.types";
import {CollapsibleList} from "../core/CollapsibleList"

interface EnergiaProps {
  data: GraphData["energia"];
}
const Energia:React.FC<EnergiaProps> = ({data}) => {
  return (
    <div className="cube_container" id="Energia">
      <div className="title_container">
        <h2>Energia</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>
      <div className="center full_width rows">
        <div className="columns center full_width ">
          <div id="pieEnergiaContainer" className="pieContainer">
            <div id="pieEnergia">
              <StackedBarChart  keys={['motor', 'maquina']} labelY="KW" data={data?.StackedBar} />
            </div>
          </div>
        </div>
        <div id="lineEnergiaContainer" className="lineContainer">
          <div id="lineEnergia">
            <TimeSeriesLineChart labelY="KW" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="KW" />
          </div>
        </div>
        <ul className="legend" id="legendEnergia"></ul>
      </div>
    </div>
  );
};

export default Energia;
