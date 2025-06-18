import { PolarChart, TimeSeriesLineChart } from '../graphs/index';

const Indicadores: React.FC = () => {
  return (
    <div className="cube_container" id="Indicadores">
      <div className="title_container">
        <h2>Indicadores</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>
      <div className="center full_width rows">
        <div id="indicadoresSubCont">
          <div id="master_indicadores">
            <div className="columns">
              {/*Disponibilidad*/}
              <div className="campo_ind rows">
                <h3>Disponibilidad</h3>
                <p className="indicador">
                  <span id="indicadorDisponibilidad">82</span>%
                </p>
                <div id="underlineDisponibilidad" className="underline_ind" />
                <h2>Tiempo activo</h2>
              </div>
              {/*Rendimiento*/}
              <div className="campo_ind rows">
                <h3>Rendimiento</h3>
                <p className="indicador">
                  <span id="indicadorRendimiento">82</span>%
                </p>
                <div id="underlineRendimiento" className="underline_ind" />
                <h2>Produccion realizada</h2>
              </div>
            </div>
            <div className="columns">
              {/*Calidad*/}
              <div className="campo_ind rows">
                <h3>Calidad</h3>
                <p className="indicador">
                  <span id="indicadorCalidad">82</span>%
                </p>
                <div id="underlineCalidad" className="underline_ind" />
                <h2>Unidades buenas</h2>
              </div>
              {/*Eficiencia*/}
              <div id="eficiencia_indicador" className="campo_ind rows">
                <h3>Eficiencia</h3>
                <p className="indicador">
                  <span id="indicadorEficiencia">82</span>%
                </p>
                <div id="underlineEficiencia" className="underline_ind" />
                <h2>Utilidad de recursos</h2>
              </div>
            </div>
          </div>
          <div id="pieContCont" className="columns center  ">
            <div id="pieIndicadoresContainer" className="pieContainer">
              <div id="pieIndicadores">
                <PolarChart />
              </div>
            </div>
          </div>
        </div>
        <div id="lineIndicadoresContainer" className="lineContainer">
          <div id="lineIndicadores">
            <TimeSeriesLineChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indicadores;
