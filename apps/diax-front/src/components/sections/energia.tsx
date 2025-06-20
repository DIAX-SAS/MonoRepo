import { TimeSeriesLineChart, StackedBarChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import { CollapsibleList } from '../core/CollapsibleList';
import styles from "../../app/dashboard-new/styles.module.scss"

interface EnergiaProps {
  data: GraphData['energia'];
}

const Energia: React.FC<EnergiaProps> = ({ data }) => {
  return (
    <div className={`${styles.cube_container} ${styles.Energia}`}>
      <div className={styles.title_container}>
        <h2 className={`${styles.h2}`}>Energia</h2>
        <div className={styles.columns}>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <div className={`${styles.columns} ${styles.center} ${styles.full_width}`}>
          <div className={`${styles.pieEnergiaContainer} ${styles.pieContainer}`}>
            <div className={styles.pieEnergia}>
              <StackedBarChart keys={['motor', 'maquina']} labelY="KW" data={data?.StackedBar} />
            </div>
          </div>
        </div>
        <div className={`${styles.lineEnergiaContainer} ${styles.lineContainer}`}>
          <div className={styles.lineEnergia}>
            <TimeSeriesLineChart labelY="KW" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="KW" />
          </div>
        </div>
        <ul className={`${styles.legend} ${styles.legendEnergia} ${styles.ul}`}></ul>
      </div>
    </div>
  );
};

export default Energia;
