import * as React from 'react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { render, screen } from '@testing-library/react';
import CardFactor from '../CardFactor';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('CardFactor Component', () => {
  const theme = createTheme();

  const renderWithTheme = (ui: React.ReactNode) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  test('renders the title and progress value', () => {
    renderWithTheme(<CardFactor title="Task Progress" value={75} />);

    expect(screen.getByText(/Task Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/75%/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '75'
    );
  });

  test('handles undefined value by defaulting to 0', () => {
    renderWithTheme(<CardFactor title="Task Progress" value={undefined} />);

    expect(screen.getByText(/Task Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/0%/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
  });
});
