import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import { CollapsibleList } from "../core/CollapsibleList";
import styles from "../../app/dashboard-new/styles.module.scss"

interface DisponibilidadProps {
  data: GraphData['disponibilidad'];
}

const Disponibilidad: React.FC<DisponibilidadProps> = ({ data }) => {
  return (
    <div className={`${styles.cube_container} ${styles.Disponibilidad}`}>
      <div className={styles.title_container}>
        <h2 className={`${styles.h2}`}>Disponibilidad</h2>
        <div className={styles.columns}>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <ul className={`${styles.legend} ${styles.ul}`} />
        <div className={styles.lineContainer}>
          <div className={styles.lineDisponibilidad}>
            <TimeSeriesLineChart labelY="minutos" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="minutos" />
          </div>
        </div>
        <div className={`${styles.rows} ${styles.center} ${styles.full_width}`}>
          <div className={`${styles.pieContainer} ${styles.margin_gd}`}>
            <MultiLayerPieChart unit="minutos" data={data?.MultiPie} />
            <div className={styles.pieDisponibilidad} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disponibilidad;
