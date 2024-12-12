import { SxProps } from "@mui/material/styles";

export interface EntireObject {
  tasksData: TaskData[];
  stateVariables: Data;
  indicatorsData: Indicators
  factorsOee: Factor[];
  mountingData: Mounting[];
  energyData: Energy;
  materialData: Material;
  cycleData: Cycle[];
}

export interface Indicators {
  line_chart: LineChart;
  polar_chart: PolarChart;
  title: string;
};
export interface TaskData {
  value: number;
  name: string; 
}
export interface CycleProps {
  data: Cycle[];
}



export interface StateVariables {
  worker: number[];
  mold: number[];
  machine: number[];
  lot: number[];
  material: number[];
  order: number[];
  [key: string]: number[];
}

export interface LineChart {
  xaxis: string[] | number[];
  lines: Line[];
}

export interface Line {
  xdata?: number[];
  ydata: number[];
}

export interface PolarChart {
  availability: number;
  performance: number;
  quality: number;
}

export interface Factor {
  title: string;
  charts: {
    line_chart: LineChart;
    pie_chart: Data;
  };
}

export interface PieChart {
  first_layer: Layer;
  second_layer?: Layer;
  third_layer?: Layer;
}

export interface Layer {
  labels: string[];
  data: number[];
}

export interface Mounting {
  numberMachine: number;
  order: number;
  worker: number;
  lot: number;
  mold: number;
  material: number;
}

export interface Energy {
  charts: {
    line_chart: LineChart;
    bar_chart: BarChart;
  };
}

export interface BarChart {
  labels: string[];
  firstValues: number[];
  secondValues: number[];
}

export interface Material {
  charts: {
    mold: Mold;
    machine: Machine;
  };
}

export interface Mold {
  pie_chart: Data;
  line_chart: LineChart;
}

export interface Machine {
  pie_chart: Data;
  line_chart: LineChart;
}

export interface Cycle {
  idMachine: number;
  charts: {
    line_chart: LineChart;
    pie_chart: Data;
  };
}

export interface Data {
  [key: string]: any;
}

export interface PieChartProps {
  data: Data
}

export interface PieChartData {
  labels: string[];
  parents: string[];
  values: number[];
}

export interface EnergyProps {
  data: Energy;
}
export interface IndicatorsST{
  data: Indicators;
}
export interface MaterialProps {
  data: Material;
}


export interface DataStructure {
  title: string;
  charts: {
    line_chart: LineChart;
    pie_chart: Data;
  };
}

export interface Polar {
  sx?: string;
  data: PolarChart;
}

export interface PolarChart {
  availability: number;
  performance: number;
  quality: number;
}

export interface TasksProgress {
  data: Data;
  setEntireObject:React.Dispatch<React.SetStateAction<string | null>>;
  
}

export interface TasksProgressProps {
  sx?: SxProps;
  data: TaskData;
 
}

export interface PolarChartData {
  availability: number;
  performance: number;
  quality: number;
}

export interface PolarChartComponentProps {
  data: PolarChartData;
}

export interface LineChartProps {
  data: LineChart;
}
