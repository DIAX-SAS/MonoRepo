import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';

const Energia = (): React.FC => {
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
              <MultiLayerPieChart />
            </div>
          </div>
        </div>
        <div id="lineEnergiaContainer" className="lineContainer">
          <div id="lineEnergia">
            <TimeSeriesLineChart />
          </div>
        </div>
        <ul className="legend" id="legendEnergia"></ul>
      </div>
    </div>
  );
};

export default Energia;
