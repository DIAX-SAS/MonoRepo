import { act, render, screen } from '@testing-library/react';
import Page from '../page';
import { ResponsePimms, ResponseToken } from '../dashboard.types';

jest.mock('next-auth/react', () => ({
  __esModule: true,
  signIn: jest.fn(),
  useSession: jest.fn(() => ({
    data: {
      accessToken: 'mocked_access_token',
      user: { name: 'Fernando' },
    },
    status: 'authenticated',
  })),
}));

jest.mock('../../../components/sections/header', () => {
  const MockedHeader = () => <div>Mocked Header</div>;
  MockedHeader.displayName = 'MockedHeader';
  return MockedHeader;
});
jest.mock('../../../components/sections/configuracion', () => {
  const MockedConfiguration = () => <div>Mocked Configuration</div>;
  MockedConfiguration.displayName = 'MockedConfiguration';
  return MockedConfiguration;
});
jest.mock('../../../components/sections/indicadores', () => {
  const MockedIndicadores = () => <div>Mocked Indicadores</div>;
  MockedIndicadores.displayName = 'MockedIndicadores';
  return MockedIndicadores;
});
jest.mock('../../../components/sections/calidad', () => {
  const MockedCalidad = () => <div>Mocked Calidad</div>;
  MockedCalidad.displayName = 'MockedCalidad';
  return MockedCalidad;
});
jest.mock('../../../components/sections/disponibilidad', () => {
  const MockedDisponibilidad = () => <div>Mocked Disponibilidad</div>;
  MockedDisponibilidad.displayName = 'MockedDisponibilidad';
  return MockedDisponibilidad;
});
jest.mock('../../../components/sections/rendimiento', () => {
  const MockedRendimiento = () => <div>Mocked Rendimiento</div>;
  MockedRendimiento.displayName = 'MockedRendimiento';
  return MockedRendimiento;
});
jest.mock('../../../components/sections/ciclos', () => {
  const MockedCiclos = () => <div>Mocked Ciclos</div>;
  MockedCiclos.displayName = 'MockedCiclos';
  return MockedCiclos;
});
jest.mock('../../../components/sections/montaje', () => {
  const MockedMontaje = () => <div>Mocked Montaje</div>;
  MockedMontaje.displayName = 'MockedMontaje';
  return MockedMontaje;
});
jest.mock('../../../components/sections/material', () => {
  const MockedMaterial = () => <div>Mocked Material</div>;
  MockedMaterial.displayName = 'MockedMaterial';
  return MockedMaterial;
});
jest.mock('../../../components/sections/energia', () => {
  const MockedEnergia = () => <div>Mocked Energia</div>;
  MockedEnergia.displayName = 'MockedEnergia';
  return MockedEnergia;
});



jest.mock('../../../data-access/diax-back/diax-back', () => {  
  return {
    __esModule: true,
    fetchPIMMs: jest.fn((): Promise<ResponsePimms> => 
      Promise.resolve({
        lastID: null,
        pimms: [],
        totalProcessed: 0,
      })
    ),
    fetchCredentialsCore: jest.fn((): Promise<ResponseToken> => 
      Promise.resolve({ 
        token: {
          sessionToken: 'mocked-token',
          // Add other required token properties if needed
        } 
      })
    ),
  };
});

jest.mock("../../../components/filters/filter-form", () =>{
  return {
    __esModule:true,
    default: () => (<div>Mocked Filters</div>)
  }
})

describe('Dashboard page', () => {
  it('should render successfully', async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByText('Mocked Configuration')).toBeDefined();
  });
});
