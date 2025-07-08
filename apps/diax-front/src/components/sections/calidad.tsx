import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from "../../app/dashboard/dashboard.types";
import { CollapsibleList } from "../core/CollapsibleList";
import styles from "../../app/dashboard/styles.module.scss";
import React, { useState } from 'react';

interface CalidadProps {
  data: GraphData["indicadores"] | undefined;
}

const Calidad: React.FC<CalidadProps> = ({ data }) => {
  const [active, setActive] = useState(true);

  return (
    <div className={`${styles["cube-container"]} ${styles.calidad}`}>
      <div className={styles["title-container"]}>
        <h2 className={styles.h2}>Calidad</h2>
        <div className={styles.columns}>
          <div 
            onClick={() => setActive(prev => !prev)} 
            className={`${styles["button-minimize-down"]} ${styles["button-main"]} ${styles.center}`}
            aria-label={active ? "Minimize section" : "Expand section"}
          >
            <div />
          </div>
        </div>
      </div>
      
      <div className={`${styles.center} ${styles["full-width"]} ${styles.rows} ${active ? "" : styles.hide}`}>
        <ul className={`${styles.legend} ${styles["legend-calidad"]} ${styles.ul}`}></ul>
        
        <div className={`${styles["line-calidad-container"]} ${styles["line-container"]}`}>
          <div className={styles["line-calidad"]}>
            <TimeSeriesLineChart labelY="unidades" series={data?.MultiLine} />
            <CollapsibleList data={data?.MultiPie} unit="unidades" />
          </div>
        </div>
        
        <div className={`${styles.rows} ${styles.center} ${styles["full-width"]}`}>
          <div className={`${styles["pie-calidad-container"]} ${styles["pie-container"]} ${styles["margin-gd"]}`}>
            <div className={styles["pie-calidad"]}>
              <MultiLayerPieChart unit="unidades" data={data?.MultiPie} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calidad;