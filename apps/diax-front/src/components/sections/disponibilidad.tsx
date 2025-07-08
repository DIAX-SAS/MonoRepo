import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard/dashboard.types';
import { CollapsibleList } from "../core/CollapsibleList";
import styles from "../../app/dashboard/styles.module.scss"
import React from 'react';

interface DisponibilidadProps {
  data: GraphData['disponibilidad'] | undefined;
}

const Disponibilidad: React.FC<DisponibilidadProps> = ({ data }) => {
  const [active, setActive] = React.useState(true);
  return (
    <div className={`${styles["cube-container"]} ${styles.disponibilidad}`}>
      <div className={styles["title-container"]}>
        <h2 className={`${styles.h2}`}>Disponibilidad</h2>
        <div className={styles.columns}>
          <div  onClick={() => setActive(prev => !prev)}  className={`${styles["button-minimize-down"]} ${styles["button-main"]} ${styles.center} `}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles["full-width"]} ${styles.rows} ${active ? "" : styles.hide}`}>
        <ul className={`${styles.legend} ${styles.ul}`} />
        <div className={styles["line-container"]}>
          <div className={styles["line-disponibilidad"]}>
            <TimeSeriesLineChart labelY="minutos" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="minutos" />
          </div>
        </div>
        <div className={`${styles.rows} ${styles.center} ${styles["full-width"]}`}>
          <div className={`${styles["pie-container"]} ${styles["margin-gd"]}`}>
            <MultiLayerPieChart unit="minutos" data={data?.MultiPie} />
            <div className={styles["pie-disponibilidad"]} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disponibilidad;
