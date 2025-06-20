import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from "../../app/dashboard-new/dashboard.types";
import {CollapsibleList} from "../core/CollapsibleList"

import styles from "../../app/dashboard-new/styles.module.scss"
interface CalidadProps {
  data: GraphData["indicadores"];
}
const Calidad:React.FC<CalidadProps> = ({data}) => {
  return (
    <div className={`${styles.cube_container} ${styles.Calidad}`}>
      <div className={styles.title_container}>
        <h2 className={styles.h2}>Calidad</h2>
        <div className={styles.columns}>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <ul className={`${styles.legend} ${styles.legendCalidad} ${styles.legendCalidad} ${styles.ul}`}></ul>
        <div className={`${styles.lineCalidadContainer} ${styles.lineContainer}`}>
          <div className={`${styles.lineCalidad}`}>
            <TimeSeriesLineChart labelY="unidades" series={data?.MultiLine}/>
            <CollapsibleList data={data?.MultiPie} unit="unidades"/>
          </div>
        </div>
        <div className={`${styles.rows} ${styles.center} ${styles.full_width}`} >
          <div className={`${styles.pieCalidadContainer} ${styles.pieContainer} ${styles.margin_gd}`}>
            <div className={`${styles.pieCalidad}`}>
              <MultiLayerPieChart unit="unidades" data={data?.MultiPie}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calidad;
