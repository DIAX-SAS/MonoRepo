import Image from 'next/image';

const Montaje = (): React.FC => {
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
        <div id="MontajePlcCont" className="rows center ">
          <h2>Maquina</h2>
          <select id="MontajePlc"></select>
        </div>
        <Image
          src="/assets/img_machine.png"
          alt="Machine image"
          width={200}
          height={200}
        />
        <div id="montajeLabels">
          <div id="montajeOrden">
            Orden: <span>0</span>
          </div>
          <div id="montajeOperario">
            Operario: <span>0</span>
          </div>
          <div id="montajeLote">
            Lote: <span>0</span>
          </div>
          <div id="montajeMolde">
            Molde: <span>0</span>
          </div>
          <div id="montajeMaterial">
            Material: <span>0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Montaje;
