import Image from 'next/image';
import { useState } from 'react';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';
import styles from "../../app/dashboard-new/styles.module.scss"

interface MontajeProps {
  data: GraphData['montaje'] | undefined;
}

const Montaje: React.FC<MontajeProps> = ({ data }) => {
  const [selectedPlcId, setSelectedPlcId] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlcId(e.target.value);
  };

  const plcIds = Array.from(
    new Set(
      data?.Mounting?.map(
        (item) =>
          item.states.find((state) => state.name === 'Numero Inyectora')?.value
      ).filter(Boolean)
    )
  );

  const selectedMachine = data?.Mounting?.find(
    (item) =>
      item.states
        .find((state) => state.name === 'Numero Inyectora')
        ?.value?.toString() === selectedPlcId
  );

  const getStateValue = (name: string) =>
    selectedMachine?.states.find((state) => state.name === name)?.value ?? '-';

  return (
    <div className={`${styles.cube_container} ${styles.Montaje}`}>
      <div className={styles.title_container}>
        <h2 className={`${styles.h2}`}>Montaje</h2>
        <div className={styles.columns}>
          <div
            className={`${styles.button_minimize_down} ${styles.button_main} ${styles.center}`}
          >
            <div />
          </div>
        </div>
      </div>

      <div className={`${styles.center} ${styles.full_width} ${styles.rows}`}>
        <div
          className={`${styles.rows} ${styles.center} ${styles.MontajePlcCont}`}
        >
          <h2 className={`${styles.h2}`}>Máquina</h2>
          <select
            className={`${styles.MontajePlc} ${styles.select}`}
            onChange={handleChange}
            value={selectedPlcId}
          >
            <option className={`${styles.option}`} value="">Seleccione una máquina</option>
            {plcIds.map((plcId) => (
              <option className={`${styles.option}`} key={plcId} value={String(plcId)}>
                Iny {plcId}
              </option>
            ))}
          </select>
        </div>

        <Image
          src="/assets/img_machine.png"
          alt="Machine image"
          width={200}
          height={200}
        />

        <div className={styles.montajeLabels}>
          <div className={styles.montajeOrden}>
            Orden: <span className={`${styles.span}`}>{getStateValue('Orden')}</span>
          </div>
          <div className={styles.montajeOperario}>
            Operario: <span className={`${styles.span}`}>{getStateValue('Operario')}</span>
          </div>
          <div className={styles.montajeLote}>
            Lote: <span className={`${styles.span}`}>{getStateValue('Lote')}</span>
          </div>
          <div className={styles.montajeMolde}>
            Molde: <span className={`${styles.span}`}>{getStateValue('Molde')}</span>
          </div>
          <div className={styles.montajeMaterial}>
            Material: <span className={`${styles.span}`}>{getStateValue('Material')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Montaje;
