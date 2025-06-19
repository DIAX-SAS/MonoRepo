import Image from 'next/image';
import { useState } from 'react';
import type { GraphData } from '../../app/dashboard-new/dashboard.types';

interface MontajeProps {
  data: GraphData['montaje'] | undefined;
}

const Montaje: React.FC<MontajeProps> = ({ data }) => {
  const [selectedPlcId, setSelectedPlcId] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlcId(e.target.value);
  };

  // Extract all unique PLC IDs from data
  const plcIds = Array.from(
    new Set(
      data?.Mounting?.map((item) =>
        item.states.find((state) => state.name === 'Numero Inyectora')?.value
      ).filter(Boolean)
    )
  );

  // Find selected machine
  const selectedMachine = data?.Mounting?.find((item) =>
    item.states.find((state) => state.name === 'Numero Inyectora')?.value?.toString() === selectedPlcId
  );

  // Utility to get a value by state name
  const getStateValue = (name: string) =>
    selectedMachine?.states.find((state) => state.name === name)?.value ?? '-';

  return (
    <div className="cube_container" id="Montaje">
      <div className="title_container">
        <h2>Montaje</h2>
        <div className="columns">
          <div className="button_minimize_down button_main center">
            <div />
          </div>
        </div>
      </div>

      <div className="center full_width rows">
        <div id="MontajePlcCont" className="rows center">
          <h2>Máquina</h2>
          <select id="MontajePlc" onChange={handleChange} value={selectedPlcId}>
            <option value="">Seleccione una máquina</option>
            {plcIds.map((plcId) => (
              <option key={plcId} value={String(plcId)}>
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

        <div id="montajeLabels">
          <div id="montajeOrden">
            Orden: <span>{getStateValue('Orden')}</span>
          </div>
          <div id="montajeOperario">
            Operario: <span>{getStateValue('Operario')}</span>
          </div>
          <div id="montajeLote">
            Lote: <span>{getStateValue('Lote')}</span>
          </div>
          <div id="montajeMolde">
            Molde: <span>{getStateValue('Molde')}</span>
          </div>
          <div id="montajeMaterial">
            Material: <span>{getStateValue('Material')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Montaje;
