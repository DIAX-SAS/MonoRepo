import { useState } from 'react';
import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import { CollapsibleList } from "../core/CollapsibleList";
import styles from "../../app/dashboard-new/styles.module.scss"

interface MaterialProps {
  data: GraphData['material'][] | undefined;
}

const Material: React.FC<MaterialProps> = ({ data }) => {
  const [groupBy, setGroupBy] = useState<number>(0); // 0: PIMM, 1: Molde
  const selectedData = data?.[groupBy];

  return (
    <div className={`${styles.cube_container} ${styles.Material}`}>
      <div className={styles.title_container}>
        <h2 className={`${styles.h2}`}>Material</h2>
        <div className={styles.columns}>
          <div className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}>
            <div />
          </div>
        </div>
      </div>

      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <ul className={`${styles.legend} ${styles.ul}`}></ul>

        <div className={styles.lineContainer}>
          <div className={styles.lineMaterial}>
            {selectedData?.MultiLine ? (
              <>
                <TimeSeriesLineChart series={selectedData.MultiLine} labelY="gramos" />
                <CollapsibleList data={selectedData?.MultiPie} unit="gramos" />
              </>
            ) : (
              <p>No hay datos de línea disponibles</p>
            )}
          </div>
        </div>

        <div className={`${styles.rows} ${styles.center} ${styles.full_width}`}>
          <div className={`${styles.pieContainer} ${styles.margin_gd}`}>
            <div className={styles.pieMaterial}>
              {selectedData?.MultiPie ? (
                <MultiLayerPieChart data={selectedData.MultiPie} unit="gramos" />
              ) : (
                <p>No hay datos de pastel disponibles</p>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.rows} ${styles.center} ${styles.MaterialPlcCont}`}>
          <h2 className={`${styles.h2}`}>Agrupación</h2>
          <select
            className={`${styles.MaterialPlc} ${styles.select}`}
            value={groupBy}
            onChange={(e) => setGroupBy(Number(e.target.value))}
          >
            <option className={`${styles.option}`} value={0}>PIMM</option>
            <option className={`${styles.option}`} value={1}>Molde</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Material;
