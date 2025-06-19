import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import {CollapsibleList} from "../core/CollapsibleList"
interface DisponibilidadProps {
  data: GraphData['disponibilidad'];
}

const Disponibilidad: React.FC<DisponibilidadProps> = ({data}) => {
  return (
    <div className="cube_container" id="Disponibilidad">
      <div className="title_container">
        <h2>Disponibilidad</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>
      <div className="center full_width rows">
        <ul className="legend" id="legendDisponibilidad"></ul>
        <div id="lineDisponibilidadContainer" className="lineContainer">
          <div id="lineDisponibilidad">
            <TimeSeriesLineChart labelY="minutos" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="minutos"/>
          </div>
        </div>
        <div className="rows center full_width ">
          <div
            id="pieDisponibilidadContainer"
            className="pieContainer margin_gd"
          >
            <MultiLayerPieChart unit="minutos" data={data?.MultiPie} />
            <div id="pieDisponibilidad"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disponibilidad;
