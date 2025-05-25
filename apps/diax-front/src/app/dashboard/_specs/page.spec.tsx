import { act, render, screen, waitFor } from '@testing-library/react';
import Page from '../page';
import { ResponsePimms } from '../dashboard.types';

jest.mock('../../../components/graphs/CardFactor', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked CardFactor</div>,
  };
});

jest.mock('../../../components/graphs/LineChart', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked TimeSeriesLineChart</div>,
    LineSeries: jest.fn(),
  };
});

jest.mock('../../../components/graphs/MultiLayerPieChart', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked MultiLayerPieChart</div>,
    ChartNode: jest.fn(),
  };
});

jest.mock('../../../components/graphs/PolarChart', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked PolarChart</div>,
    CategoryPolar: jest.fn(),
  };
});

jest.mock('../../../components/graphs/StackedBarChart', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked StackedBarChart</div>,
    Category: jest.fn(),
  };
});

jest.mock('../../../components/graphs/Table', () => {
  return {
    __esModule: true,
    default: () => <div>Mocked Table</div>,
  };
});

jest.mock('../../../hooks/useAuthSession', () => {
  return {
    __esModule: true,
    useAuthSession: () => ({
      session: 'mocked-session',
      status: 'mocked-status',
      isRefreshing: 'false',
    }),
  };
});

jest.mock('../../../data-access/diax-back/diax-back', () => {
  return {
    __esModule: true,
    fetchData: (): ResponsePimms => ({
      lastID: null,
      pimms: [],
      totalProcessed: 0,
    }),
    fetchCredentialsCore: () => ({ token: 'mocked-token' }),
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
    expect(screen.getByText('Configuración')).toBeDefined();
  });
  it('should render all graph components successfully', async () => {
    render(<Page />);

    
    await waitFor(() => {
      expect(screen.queryAllByText("Mocked CardFactor")).not.toHaveLength(0);
      expect(screen.queryAllByText("Mocked TimeSeriesLineChart")).not.toHaveLength(0);
      expect(screen.queryAllByText("Mocked MultiLayerPieChart")).not.toHaveLength(0);
      expect(screen.getByText("Mocked PolarChart")).toBeDefined();
      expect(screen.getByText("Mocked StackedBarChart")).toBeDefined();
      expect(screen.getByText("Mocked Table")).toBeDefined();
    });
  });

  it('should render all filters successfully', async () => {
    await act(async () => {
      render(<Page />);
    });
    expect(screen.getByText("Mocked Filters")).toBeDefined();
  })
});
