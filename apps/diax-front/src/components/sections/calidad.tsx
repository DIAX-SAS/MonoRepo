import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';

const Calidad = (): React.FC => {
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
            <TimeSeriesLineChart />
          </div>
        </div>
        <div className="rows center full_width ">
          <div id="pieCalidadContainer" className="pieContainer margin_gd">
            <div id="pieCalidad" className="js-plotly-plot">
              <MultiLayerPieChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calidad;
