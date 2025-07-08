import * as React from 'react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { render, screen } from '@testing-library/react';
import MountingTable from '../Table';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FEPIMM } from '../../../app/dashboard/dashboard.types';

describe('MountingTable Component', () => {
  const theme = createTheme();

  const renderWithTheme = (ui: React.ReactNode) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  const mockData: FEPIMM[] = [
    {
      buenas: 0,
      ineficiencias: 0,
      producidas: 0,
      maquina: 0,
      timestamp: 0,
      plcId: 1,
      states: [
        { id: 's1', valueType: 'integer', name: 'State 1', value: '10' },
        { id: 's2', valueType: 'integer', name: 'State 2', value: '20' },
      ],
      counters: [
        { id: 'c1', valueType: 'integer', name: 'Counter 1', value: '30' },
        { id: 'c2', valueType: 'integer', name: 'Counter 2', value: '40' },
      ],
    },
    {
      buenas: 0,
      ineficiencias: 0,
      producidas: 0,
      maquina: 0,
      timestamp: 0,
      plcId: 2,
      states: [
        { id: 's1', valueType: 'integer', name: 'State 1', value: '50' },
        { id: 's2', valueType: 'integer', name: 'State 2', value: '60' },
      ],
      counters: [
        { id: 'c1', valueType: 'integer', name: 'Counter 1', value: '70' },
        { id: 'c2', valueType: 'integer', name: 'Counter 2', value: '80' },
      ],
    },
  ];

  test('renders table with correct headers and values', () => {
    renderWithTheme(<MountingTable data={mockData} />);

    // Check headers
    expect(screen.getByText('State 1')).toBeInTheDocument();
    expect(screen.getByText('State 2')).toBeInTheDocument();

    // Check cell values (states only)
    expect(screen.getByRole("cell", { name: "10" })).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

});
