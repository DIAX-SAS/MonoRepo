import { PolarChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from "../../app/dashboard-new/dashboard.types";
import styles from "../../app/dashboard-new/styles.module.scss"

interface IndicadoresProps {
  data: GraphData["indicadores"];
}

const Indicadores: React.FC<IndicadoresProps> = ({ data }) => {
  return (
    <div className={`${styles.cube_container} ${styles.Indicadores}`}>
      <div className={styles.title_container}>
        <h2 className={`${styles.h2}`}>Indicadores</h2>
        <div className={styles.columns}>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <div className={styles.indicadoresSubCont}>
          <div className={styles.master_indicadores}>
            <div className={styles.columns}>
              {/* Disponibilidad */}
              <div className={`${styles.campo_ind} ${styles.rows}`}>
                <h3 className={`${styles.h3}`}>Disponibilidad</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span className={`${styles.indicadorDisponibilidad} ${styles.span}`}>{data?.OEE?.availability}</span>%
                </p>
                <div className={`${styles.underline_ind} ${styles.underlineDisponibilidad}`} />
                <h2 className={`${styles.h2}`}>Tiempo activo</h2>
              </div>
              {/* Rendimiento */}
              <div className={`${styles.campo_ind} ${styles.rows}`}>
                <h3 className={`${styles.h3}`}>Rendimiento</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span className={`${styles.indicadorRendimiento} ${styles.span}`}>{data?.OEE?.performance}</span>%
                </p>
                <div className={`${styles.underline_ind} ${styles.underlineRendimiento}`} />
                <h2 className={`${styles.h2}`}>Produccion realizada</h2>
              </div>
            </div>
            <div className={styles.columns}>
              {/* Calidad */}
              <div className={`${styles.campo_ind} ${styles.rows}`}>
                <h3 className={`${styles.h3}`}>Calidad</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span className={`${styles.indicadorCalidad} ${styles.span}`}>{data?.OEE?.quality}</span>%
                </p>
                <div className={`${styles.underline_ind} ${styles.underlineCalidad}`} />
                <h2 className={`${styles.h2}`}>Unidades buenas</h2>
              </div>
              {/* Eficiencia */}
              <div className={`${styles.campo_ind} ${styles.rows} ${styles.eficiencia_indicador}`}>
                <h3 className={`${styles.h3}`}>Eficiencia</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span className={`${styles.indicadorEficiencia} ${styles.span}`}>{data?.OEE?.efficiency}</span>%
                </p>
                <div className={`${styles.underline_ind} ${styles.underlineEficiencia}`} />
                <h2 className={`${styles.h2}`}>Utilidad de recursos</h2>
              </div>
            </div>
          </div>

          <div className={`${styles.pieContCont} ${styles.columns} ${styles.center}`}>
            <div className={`${styles.pieIndicadoresContainer} ${styles.pieContainer}`}>
              <div className={styles.pieIndicadores}>
                <PolarChart data={data?.Polar} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.lineContainer}>
          <div className={styles.lineIndicadores}>
            <TimeSeriesLineChart series={data?.MultiLine} labelY="OEE %" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indicadores;
