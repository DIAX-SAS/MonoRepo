import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';

const Ciclos = (): React.FC => {
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
        <div className="columns center full_width ">
          <div id="pieCiclosContainer" className="pieContainer">
            <div id="pieCiclos">
              <MultiLayerPieChart />
            </div>
          </div>
          <ul className="legend" id="legendCiclos"></ul>
        </div>
        <div id="lineCiclosContainer" className="lineContainer">
          <div id="lineCiclos">
            <TimeSeriesLineChart />
          </div>
        </div>
        <div id="ciclePlcCont" className="rows center ">
          <h2>Maquina</h2>
          <select id="ciclePlc"></select>
        </div>
      </div>
    </div>
  );
};

export default Ciclos;
