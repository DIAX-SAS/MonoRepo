import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';

const Material = (): React.FC => {
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
            <TimeSeriesLineChart />
          </div>
        </div>
        <div className="rows center full_width ">
          <div id="pieMaterialContainer" className="pieContainer margin_gd">
            <div id="pieMaterial">
              <MultiLayerPieChart />
            </div>
          </div>
        </div>
        <div id="MaterialPlcCont" className="rows center ">
          <h2>Agrupación</h2>
          <select id="MaterialPlc"></select>
        </div>
      </div>
    </div>
  );
};

export default Material;
