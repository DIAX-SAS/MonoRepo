import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

interface DataPoint {
  timestamp: number;
  value: number;
}

interface LineSeries {
  name: string;
  data: DataPoint[];
}

interface TimeSeriesLineChartProps {
  width?: number;
  height?: number;
  series: LineSeries[];
  labelY: string;
}

const colors = {
  blue: ["#3366D6", "#4285F4", "#71A3F7", "#A0C2FA", "#D0E0FC"],
  purple: ["#BE53C4", "#E585EB", "#F0B0F3", "#F4CFF6", "#F9F1F9"],
  red: ["#FB4826", "#F9674D", "#FC9885", "#FCBBAF", "#FCE0DB"],
  green: ["#1EC828", "#4BE354", "#7DEF84", "#ACF8B0", "#CEFED1"],
  cyan: ["#23C897", "#41E6B5", "#76F1CC", "#A8F6DF", "#D9F6EE"],
};

const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({ width = 600, height = 400, series, labelY }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const margin = { top: 30, right: 100, bottom: 60, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const allData = useMemo(() => series.flatMap((s) => s.data), [series]);
  const xExtent = d3.extent(allData, (d) => new Date(d.timestamp * 1000)) as [Date, Date];
  const yMax = d3.max(allData, (d) => d.value) || 0;

  const xScale = useMemo(() => d3.scaleTime().domain(xExtent).range([0, chartWidth]), [xExtent, chartWidth]);
  const yScale = useMemo(() => d3.scaleLinear().domain([0, yMax]).nice().range([chartHeight, 0]), [yMax, chartHeight]);

  useEffect(() => {
    if (!ref.current || series.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xAxisGroup = g.append("g").attr("transform", `translate(0,${chartHeight})`);
    xAxisGroup.call(d3.axisBottom(xScale).tickFormat((d: Date | d3.NumberValue) => d3.timeFormat("%H:%M:%S")(d as Date)));

    g.append("g").call(d3.axisLeft(yScale));

    // Y-Axis Label
    g.append("text")
      .attr("x", -chartHeight / 2)
      .attr("y", -50)
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(labelY);

    // X-Axis Label
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 40)
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Time");

    g.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

    const tooltip = d3.select("body").select("#tooltip");
    if (tooltip.empty()) {
      d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid black")
        .style("border-radius", "5px")
        .style("display", "none");
    }

    const colorKeys = Object.keys(colors);

    const lineGenerator = d3
      .line<DataPoint>()
      .x((d) => xScale(new Date(d.timestamp * 1000)))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    series.forEach((s, i) => {
      const colorCategory = colorKeys[i % colorKeys.length] as keyof typeof colors;
      const strokeColor = colors[colorCategory][0];

      lineGroup
        .append("path")
        .datum(s.data)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
        .attr("d", lineGenerator)
        .on("mouseover", () => {
          tooltip.style("background", strokeColor).style("display", "block").text(s.name);
        })
        .on("mousemove", (event: MouseEvent) => {
          tooltip
            .style("left", `${Math.min(event.pageX + 10, window.innerWidth - 100)}px`)
            .style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
    });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .on("zoom", (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        xAxisGroup.call(d3.axisBottom(newXScale).tickFormat((d: d3.AxisDomain, index: number) => d3.timeFormat("%H:%M:%S")(d as Date)));

        lineGroup.selectAll<SVGPathElement, DataPoint>("path").attr("d", (_, i) => {
          return d3
            .line<DataPoint>()
            .x((d) => newXScale(new Date(d.timestamp * 1000)))
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX)(series[i].data) || "";
        });
      });

    svg.call(zoom);

    svg.on("dblclick", () => {
      svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    });
  }, [width, height, series, xScale, yScale, margin.left, margin.top, chartHeight, labelY, chartWidth]);

  return <svg ref={ref}></svg>;
};

export default TimeSeriesLineChart;
