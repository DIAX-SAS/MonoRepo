import { TimeSeriesLineChart, StackedBarChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard/dashboard.types';
import { CollapsibleList } from '../core/CollapsibleList';
import styles from "../../app/dashboard/styles.module.scss"
import React from 'react';

interface EnergiaProps {
  data: GraphData['energia'] | undefined;
}

const Energia: React.FC<EnergiaProps> = ({ data }) => {
  const [active, setActive] = React.useState(true);
  return (
    <div className={`${styles["cube-container"]} ${styles.energia}`}>
      <div className={styles["title-container"]}>
        <h2 className={`${styles.h2}`}>Energia</h2>
        <div className={styles.columns}>
          <div  onClick={() => setActive(prev => !prev)}  className={`${styles["button-minimize-down"]} ${styles["button-main"]} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles["full-width"]} ${styles.rows} ${active ? "" : styles.hide}`}>
        <div className={`${styles.columns} ${styles.center} ${styles["full-width"]}`}>
          <div className={`${styles["pie-energia-container"]} ${styles["pie-container"]}`}>
            <div className={styles["pie-energia"]}>
              <StackedBarChart keys={['motor', 'maquina']} labelY="KW" data={data?.StackedBar} />
            </div>
          </div>
        </div>
        <div className={`${styles["line-energia-container"]} ${styles["line-container"]}`}>
          <div className={styles["line-energia"]}>
            <TimeSeriesLineChart labelY="KW" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="KW" />
          </div>
        </div>
        <ul className={`${styles.legend} ${styles["legend-energia"]} ${styles.ul}`}></ul>
      </div>
    </div>
  );
};

export default Energia;
