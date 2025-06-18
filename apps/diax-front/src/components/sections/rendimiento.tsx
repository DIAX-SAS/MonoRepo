import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';

const Rendimiento = (): React.FC => {
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
            <TimeSeriesLineChart />
          </div>
        </div>
        <div className="rows center full_width ">
          <div id="pieRendimientoContainer" className="pieContainer margin_gd">
            <div id="pieRendimiento">
              <MultiLayerPieChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rendimiento;
