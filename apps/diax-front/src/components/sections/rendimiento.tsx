import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import { CollapsibleList } from '../core/CollapsibleList';
import styles from "../../app/dashboard-new/styles.module.scss"

interface RendimientoProps {
  data: GraphData['rendimiento'];
}

const Rendimiento: React.FC<RendimientoProps> = ({ data }) => {
  return (
    <div className={`${styles.cube_container} ${styles.Rendimiento}`}>
      <div className={styles.title_container}>
        <h2 className={`${styles.h2}`}>Rendimiento</h2>
        <div className={styles.columns}>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>

      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <ul className={`${styles.legend} ${styles.ul} ${styles.legendRendimiento}`}></ul>

        <div className={`${styles.lineContainer} ${styles.lineRendimientoContainer}`}>
          <div className={`${styles.lineRendimiento}`}>
            <TimeSeriesLineChart labelY="inyecciones" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="inyecciones" />
          </div>
        </div>

        <div className={`${styles.rows} ${styles.center} ${styles.full_width}`}>
          <div className={`${styles.pieContainer} ${styles.margin_gd} ${styles.pieRendimientoContainer}`}>
            <div className={`${styles.pieRendimiento}`}>
              <MultiLayerPieChart unit="inyecciones" data={data?.MultiPie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rendimiento;
