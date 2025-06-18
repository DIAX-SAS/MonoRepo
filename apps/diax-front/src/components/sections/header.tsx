import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <div className="cube_container" id="title">
      <Image src="/assets/logo.svg" alt="Company Logo" width={100} height={100} />
      <h1>Equipos de Inyeccion</h1>
      <div className="rows">
        <h2>
          Live<span>Dash</span>
        </h2>
        <h2 id="version">2.0.2.2</h2>
      </div>
    </div>
  );
};

export default Header;
