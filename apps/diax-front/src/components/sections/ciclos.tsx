import React, { useState } from 'react';
import { MultiLayerPieChart, TimeSeriesLineChart } from '../graphs/index';
import type { GraphData } from '../../app/dashboard/dashboard.types';
import { CollapsibleList } from '../core/CollapsibleList';
import styles from '../../app/dashboard/styles.module.scss';
interface CiclosProps {
  data: GraphData['ciclos'] | undefined;
}

const Ciclos: React.FC<CiclosProps> = ({ data }) => {
  const [selectedPlcId, setSelectedPlcId] = useState<string | undefined>();
  const [active, setActive] = useState(true);
  const infoByPlcId: Record<string, GraphData['ciclos']> = {};

  // Extraer PLC IDs desde los nombres (ej: "Buenas PIMM 4")
  const names: string[] = data?.MultiLine?.map((line) => line.name) ?? [];
  const plcIds = names
    .map((name) => name.match(/PIMM\s*(\d+)/)?.[1]) // extrae número después de "PIMM"
    .filter(Boolean) as string[];

  for (const plcId of plcIds) {
    if (!infoByPlcId[plcId]) {
      infoByPlcId[plcId] = {
        MultiLine: [],
        MultiPie: { name: '', value: 0 },
      };
    }

    infoByPlcId[plcId].MultiLine =
      data?.MultiLine?.filter((line) => line.name.includes(`PIMM ${plcId}`)) ??
      [];

    infoByPlcId[plcId].MultiPie = data?.MultiPie?.name.includes(`PIMM ${plcId}`)
      ? data.MultiPie
      : data?.MultiPie?.children?.find((node) =>
          node.name.includes(`PIMM ${plcId}`)
        ) ?? {
          name: '',
          value: 0,
        };
  }

  const currentData = selectedPlcId ? infoByPlcId[selectedPlcId] : undefined;

  return (
    <div className={`${styles['cube-container']} ${styles['ciclos']}`}>
      <div className={`${styles['title-container']}`}>
        <h2 className={`${styles.h2}`}>Ciclos</h2>
        <div className={`${styles.columns}`}>
          <div
            onClick={() => setActive((prev) => !prev)}
            className={`${styles['button-minimize-down']} ${styles['button-main']} ${styles.center}`}
          >
            <div />
          </div>
        </div>
      </div>
      <div
        className={`${styles.center} ${styles['full-width']} ${styles.rows} ${
          active ? '' : styles.hide
        }`}
      >
        <div
          className={`${styles.columns} ${styles.center} ${styles['full-width']}`}
        >
          <div
            className={`${styles['pie-container']} ${styles['pie-ciclos-container']}`}
          >
            <div className={`${styles['pie-ciclos']}`}>
              {currentData && (
                <MultiLayerPieChart
                  unit="segundos"
                  data={currentData.MultiPie}
                />
              )}
            </div>
          </div>
          <ul
            className={`${styles.legend} ${styles['legend-ciclos']} ${styles.ul}`}
          ></ul>
        </div>
        <div
          className={`${styles['line-container']} ${styles['line-ciclos-container']}`}
        >
          <div className={`${styles['line-ciclos']}`}>
            {currentData && (
              <>
                <TimeSeriesLineChart
                  labelY="segundos"
                  series={currentData.MultiLine}
                />
                <CollapsibleList data={currentData.MultiPie} unit="segundos" />
              </>
            )}
          </div>
        </div>
        <div
          className={`${styles.rows} ${styles.center} ${styles['cicle-plc-cont']}`}
        >
          <h2 className={`${styles.h2}`}>Maquina</h2>
          <select
            className={`${styles['cicle-plc']} ${styles.select}`}
            onChange={(e) => setSelectedPlcId(e.target.value)}
            defaultValue=""
          >
            <option className={`${styles.option}`} disabled value="">
              Selecciona una Inyectora
            </option>
            {Object.keys(infoByPlcId).map((plcId) => (
              <option className={`${styles.option}`} key={plcId} value={plcId}>
                Iny {plcId}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Ciclos;
