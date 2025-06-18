import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';

const Disponibilidad = (): React.FC => {
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
            <TimeSeriesLineChart />
          </div>
        </div>
        <div className="rows center full_width ">
          <div
            id="pieDisponibilidadContainer"
            className="pieContainer margin_gd"
          >
            <MultiLayerPieChart />
            <div id="pieDisponibilidad"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disponibilidad;
