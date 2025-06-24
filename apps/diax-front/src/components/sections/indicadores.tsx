import { PolarChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from "../../app/dashboard/dashboard.types";
import styles from "../../app/dashboard/styles.module.scss"

interface IndicadoresProps {
  data: GraphData["indicadores"] | undefined;
}

const Indicadores: React.FC<IndicadoresProps> = ({ data }) => {
  return (
    <div className={`${styles["cube-container"]} ${styles.indicadores}`}>
      <div className={styles["title-container"]}>
        <h2 className={`${styles.h2}`}>Indicadores</h2>
        <div className={styles.columns}>
          <div className={`${styles["button-minimize-down"]} ${styles["button-main"]} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles["full-width"]} ${styles.rows}`}>
        <div className={styles["indicadores-sub-cont"]}>
          <div className={styles["master-indicadores"]}>
            <div className={styles.columns}>
              {/* Disponibilidad */}
              <div className={`${styles["campo-ind"]} ${styles.rows}`}>
                <h3 className={`${styles.h3}`}>Disponibilidad</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span data-testid="indicador-availability" className={`${styles["indicador-disponibilidad"]} ${styles.span}`}>{data?.OEE?.availability}</span>%
                </p>
                <div className={`${styles["underline-ind"]} ${styles["underline-disponibilidad"]}`} />
                <h2 className={`${styles.h2}`}>Tiempo activo</h2>
              </div>
              {/* Rendimiento */}
              <div className={`${styles["campo-ind"]} ${styles.rows}`}>
                <h3 className={`${styles.h3}`}>Rendimiento</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span data-testid="indicador-rendimiento" className={`${styles["indicador-rendimiento"]} ${styles.span}`}>{data?.OEE?.performance}</span>%
                </p>
                <div className={`${styles["underline-ind"]} ${styles["underline-rendimiento"]}`} />
                <h2 className={`${styles.h2}`}>Produccion realizada</h2>
              </div>
            </div>
            <div className={styles.columns}>
              {/* Calidad */}
              <div className={`${styles["campo-ind"]} ${styles.rows}`}>
                <h3 className={`${styles.h3}`}>Calidad</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span data-testid="indicador-calidad" className={`${styles["indicador-calidad"]} ${styles.span}`}>{data?.OEE?.quality}</span>%
                </p>
                <div className={`${styles["underline-ind"]} ${styles["underline-calidad"]}`} />
                <h2 className={`${styles.h2}`}>Unidades buenas</h2>
              </div>
              {/* Eficiencia */}
              <div className={`${styles["campo-ind"]} ${styles.rows} ${styles["eficiencia-indicador"]}`}>
                <h3 className={`${styles.h3}`}>Eficiencia</h3>
                <p className={`${styles.indicador} ${styles.p}`}>
                  <span data-testid="indicador-eficiencia" className={`${styles["indicador-eficiencia"]} ${styles.span}`}>{data?.OEE?.efficiency}</span>%
                </p>
                <div className={`${styles["underline-ind"]} ${styles["underline-eficiencia"]}`} />
                <h2 className={`${styles.h2}`}>Utilidad de recursos</h2>
              </div>
            </div>
          </div>

          <div className={`${styles["pie-cont-cont"]} ${styles.columns} ${styles.center}`}>
            <div className={`${styles["pie-indicadores-container"]} ${styles["pie-container"]}`}>
              <div className={styles["pie-indicadores"]}>
                <PolarChart data={data?.Polar} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles["line-container"]}>
          <div className={styles["line-indicadores"]}>
            <TimeSeriesLineChart series={data?.MultiLine} labelY="OEE %" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Indicadores;
