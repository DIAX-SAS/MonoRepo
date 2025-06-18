'use client';

import * as React from 'react';
import Header from '../../components/sections/header';
import Configuration from '../../components/sections/configuracion';
import Indicadores from '../../components/sections/indicadores';
import Calidad from '../../components/sections/calidad';
import Disponibilidad from '../../components/sections/disponibilidad';
import Rendimiento from '../../components/sections/rendimiento';
import Ciclos from '../../components/sections/ciclos';
import Montaje from '../../components/sections/montaje';
import Material from '../../components/sections/material';

import './style.css';
export default function Page(): React.JSX.Element {
  return (
    <div id="dashboard" className="noselect">
      <Header />
      <Configuration />
      <Indicadores />
      <div id="subdashboard">
        <Calidad />
        <Disponibilidad />
        <Rendimiento />
        <Ciclos />
        <Montaje />
        <Material />
      </div>
    </div>
  );
}
