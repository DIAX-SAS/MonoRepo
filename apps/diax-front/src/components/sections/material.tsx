import { useState } from 'react';
import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard/dashboard.types';
import { CollapsibleList } from '../core/CollapsibleList';
import styles from '../../app/dashboard/styles.module.scss';

interface MaterialProps {
  data: (GraphData['material'] | undefined)[];
}

const Material: React.FC<MaterialProps> = ({ data }) => {
  const [groupBy, setGroupBy] = useState<number>(0); // 0: PIMM, 1: Molde
  const [active, setActive] = useState(true);
  const selectedData = data?.[groupBy];

  return (
    <div className={`${styles['cube-container']} ${styles.Material}`}>
      <div className={styles['title-container']}>
        <h2 className={`${styles.h2}`}>Material</h2>
        <div className={styles.columns}>
          <div
            onClick={() => setActive((prev) => !prev)}
            className={`${styles['button-minimize-down']} ${styles['button-main']} ${styles.center}`}
          >
            <div />
          </div>
        </div>
      </div>
      <div className={`${styles.center} ${styles['full-width']} ${styles.rows} ${active ? '' : styles.hide}`}>
        <div
          className={`${styles.rows} ${styles.center} ${styles['material-plc-cont']}`}
        >
          <h2 className={`${styles.h2}`}>Agrupación</h2>
          <select
            className={`${styles['material-plc']} ${styles.select}`}
            value={groupBy}
            onChange={(e) => setGroupBy(Number(e.target.value))}
          >
            <option className={`${styles.option}`} value={0}>
              PIMM
            </option>
            <option className={`${styles.option}`} value={1}>
              Molde
            </option>
          </select>
        </div>
        <div
          className={`${styles.rows} ${styles.center} ${styles['full-width']}`}
        >
          <div className={`${styles['pie-container']} ${styles['margin-gd']}`}>
            <div className={styles['pie-material']}>
              {selectedData?.MultiPie ? (
                <MultiLayerPieChart
                  data={selectedData.MultiPie}
                  unit="gramos"
                />
              ) : (
                <p>No hay datos de pastel disponibles</p>
              )}
            </div>
          </div>
        </div>
        <div
          className={`${styles.center} ${styles['full-width']} ${styles.rows}`}
        >
          <ul className={`${styles.legend} ${styles.ul}`}></ul>

          <div className={styles['line-container']}>
            <div className={styles['line-material']}>
              {selectedData?.MultiLine ? (
                <>
                  <TimeSeriesLineChart
                    series={selectedData.MultiLine}
                    labelY="gramos"
                  />
                  <CollapsibleList
                    data={selectedData?.MultiPie}
                    unit="gramos"
                  />
                </>
              ) : (
                <p>No hay datos de línea disponibles</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Material;
