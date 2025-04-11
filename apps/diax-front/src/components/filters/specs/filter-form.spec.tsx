import '@testing-library/jest-dom';
import { render, screen, fireEvent } from "@testing-library/react";
import FilterForm from "../../../components/filters/filter-form"; // Adjust path if needed
import { Filters, Parameters, PimmsStepUnit } from "../../../app/dashboard/dashboard.types";

// Mock filters and parameters
const mockFilters: Filters = {
    equipos: new Map([['equipo1', true]]),
    operarios: new Map([['operario1', true]]),
    ordenes: new Map([['orden1', true]]),
    lotes: new Map([['lote1', true]]),
    moldes: new Map([['molde1', true]]),
    materiales: new Map([['material1', true]]),
  };
const mockSetFilters = jest.fn();
const mockSetParameters = jest.fn();

const mockParameters: Parameters = {
  startDate: new Date().getTime(),
  endDate: new Date().getTime(),
  live: false,
  step: PimmsStepUnit.SECOND,
};

describe("FilterForm Component", () => {
  beforeEach(() => {
    render(
      <FilterForm
        filters={mockFilters}
        setFilters={mockSetFilters}
        parameters={mockParameters}
        setParameters={mockSetParameters}
      />
    );
  });

  it("renders DateRangePicker", () => {
    const datePicker = screen.getByTestId("dateRangePicker"); // rsuite DateRangePicker renders as an input
    expect(datePicker).toBeInTheDocument();
  });

  it("renders Live checkbox", () => {
    const checkbox = screen.getByLabelText("Live");
    expect(checkbox).toBeInTheDocument();
  });

  it("calls setFilters when a filter checkbox is clicked", () => {
    const tempCheckbox = screen.getByText("equipo1");
    fireEvent.click(tempCheckbox);
    expect(mockSetFilters).toHaveBeenCalled();
  });

  it("calls setParameters when Live checkbox is toggled", () => {
    const liveCheckbox = screen.getByLabelText("Live");
    fireEvent.click(liveCheckbox);
    expect(mockSetParameters).toHaveBeenCalled();
  });

  it("calls setParameters when changing SelectPicker value", () => {
    const selectPicker = screen.getByTestId("accUnitPicker");  
    fireEvent.click(selectPicker); 
    const option = screen.getByText("Minute");
    fireEvent.click(option);
    expect(mockSetParameters).toHaveBeenCalled();
  });
  
});
