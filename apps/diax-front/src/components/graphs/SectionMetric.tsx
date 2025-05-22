import { CardContent } from "@mui/material";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import MultiLayerPieChart from "./MultiLayerPieChart";
import TimeSeriesLineChart from "./LineChart";
import {type Graphs} from "../../app/dashboard/dashboard.types";

export interface data {
    linechart: Graphs["SeriesLineChart"] | undefined;
    piechart: Graphs["MultiLayerPieChart"] | undefined;
    unit: string;
}

export function SectionMetric({
  title,
  data,
}: {
  title: string;
  data: data;
}): React.JSX.Element {
  return (
     <Card sx={{ p: 2, mb: 3 }}>
    <CardHeader
      title={title}
      sx={{ borderBottom: '1px solid #ddd' }}
    />
    <CardContent>
      <MultiLayerPieChart
        data={data.piechart?.data}
        unit={data.unit}
      />
      <TimeSeriesLineChart
        series={data.linechart?.data}
        labelY={data.unit}
      />
    </CardContent>
  </Card>
  );
}