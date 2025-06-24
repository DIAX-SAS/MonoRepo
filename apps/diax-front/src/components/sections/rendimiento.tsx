import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard/dashboard.types';
import { CollapsibleList } from '../core/CollapsibleList';
import styles from "../../app/dashboard/styles.module.scss"

interface RendimientoProps {
  data: GraphData['rendimiento'] | undefined;
}

const Rendimiento: React.FC<RendimientoProps> = ({ data }) => {
  return (
    <div className={`${styles["cube-container"]} ${styles.rendimiento}`}>
      <div className={styles["title-container"]}>
        <h2 className={`${styles.h2}`}>Rendimiento</h2>
        <div className={styles.columns}>
          <div className={`${styles["button-minimize-down"]} ${styles["button-main"]} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>

      <div className={`${styles.center} ${styles["full-width"]} ${styles.rows}`}>
        <ul className={`${styles.legend} ${styles.ul} ${styles["legend-rendimiento"]}`}></ul>

        <div className={`${styles["line-container"]} ${styles["line-rendimiento-container"]}`}>
          <div className={`${styles["line-rendimiento"]}`}>
            <TimeSeriesLineChart labelY="inyecciones" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="inyecciones" />
          </div>
        </div>

        <div className={`${styles.rows} ${styles.center} ${styles["full-width"]}`}>
          <div className={`${styles["pie-container"]} ${styles["margin-gd"]} ${styles["pie-rendimiento-container"]}`}>
            <div className={`${styles["pie-rendimiento"]}`}>
              <MultiLayerPieChart unit="inyecciones" data={data?.MultiPie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rendimiento;
