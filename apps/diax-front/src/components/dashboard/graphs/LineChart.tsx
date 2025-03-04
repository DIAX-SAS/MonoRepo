import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  timestamp: number;
  value: number;
}

interface LineSeries {
  name: string; // Line identifier
  color?: string; // Optional color
  data: DataPoint[]; // Data points for the line
}

interface TimeSeriesLineChartProps {
  width?: number;
  height?: number;
  series: LineSeries[]; // Array of datasets (multiple lines)
}

const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({ width = 600, height = 400, series }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  // const series = [
  //   {
  //     name: "Line 1",
  //     color: "steelblue",
  //     data: [
  //       { timestamp: 1700000000, value: 30 },
  //       { timestamp: 1700010033, value: 45 },
  //       { timestamp: 1700020033, value: 28 },
  //     ],
  //   },
  //   {
  //     name: "Line 2",
  //     color: "red",
  //     data: [
  //       { timestamp: 1700000000, value: 50 },
  //       { timestamp: 1700010033, value: 35 },
  //       { timestamp: 1700020033, value: 40 },
  //     ],
  //   },
  //   {
  //     name: "Line 3",
  //     color: "green",
  //     data: [
  //       { timestamp: 1700000000, value: 20 },
  //       { timestamp: 1700010033, value: 30 },
  //       { timestamp: 1700020033, value: 50 },
  //     ],
  //   },
  // ];

  useEffect(() => {
    if (!ref.current || series.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { top: 30, right: 100, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Flatten data to get global min/max timestamps
    const allData = series.flatMap((s) => s.data);
    const xExtent = d3.extent(allData, (d) => new Date(d.timestamp * 1000)) as [Date, Date];
    const yMax = d3.max(allData, (d) => d.value) || 0;

    const xScale = d3.scaleTime().domain(xExtent).range([0, chartWidth]);

    const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => d3.timeFormat("%H:%M:%S")(d as Date)))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // Y-axis
    g.append("g").call(d3.axisLeft(yScale));

    // Draw multiple lines
    series.forEach((s, i) => {
      const line = d3
        .line<DataPoint>()
        .x((d) => xScale(new Date(d.timestamp * 1000)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      g.append("path")
        .datum(s.data)
        .attr("fill", "none")
        .attr("stroke", s.color || (colorScale(i.toString()) as string)) // Assign color
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add points
      g.selectAll(`.dot-${i}`)
        .data(s.data)
        .join("circle")
        .attr("class", `dot-${i}`)
        .attr("cx", (d) => xScale(new Date(d.timestamp * 1000)))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 4)
        .attr("fill", s.color || (colorScale(i.toString()) as string));
    });

    // Legend
    const legend = g
      .append("g")
      .attr("transform", `translate(${chartWidth + 10}, 0)`);

    series.forEach((s, i) => {
      const legendRow = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", s.color || (colorScale(i.toString()) as string));

      legendRow.append("text")
        .attr("x", 15)
        .attr("y", 10)
        .text(s.name)
        .attr("font-size", "12px")
        .attr("alignment-baseline", "middle");
    });

  }, [width, height, series]); // Re-render on series update

  return <svg ref={ref}></svg>;
};

export default TimeSeriesLineChart;
