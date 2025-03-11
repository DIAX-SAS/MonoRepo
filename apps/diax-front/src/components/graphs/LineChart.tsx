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
  labelY:string;
}

const colors = {
  blue: ["#3366D6", "#4285F4", "#71A3F7", "#A0C2FA", "#D0E0FC"],
  purple: ["#BE53C4", "#E585EB", "#F0B0F3", "#F4CFF6", "#F9F1F9"],
  yellow: ["#FFA600", "#F9B432", "#F9C25C", "#FBDA9D", "#FCECCE"],
  red: ["#FB4826", "#F9674D", "#FC9885", "#FCBBAF", "#FCE0DB"],
  green: ["#1EC828", "#4BE354", "#7DEF84", "#ACF8B0", "#CEFED1"],
  cyan: ["#23C897", "#41E6B5", "#76F1CC", "#A8F6DF", "#D9F6EE"],
  orange: ["#F9E215", "#F9E84B", "#FCF08B", "#FCF8D7", "#FFFCE5"],
  pink: ["#EC2EB9", "#FF44CD", "#FC7BDA", "#FFAAE8", "#FCD7F2"],
  gray: ["#808080"],
};

const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({ width = 600, height = 400, series, labelY }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const margin = { top: 30, right: 100, bottom: 60, left: 70 }; // Adjusted bottom and left for labels
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

    // Define axes
    const xAxis = g.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M:%S") as any));

    g.append("g").call(d3.axisLeft(yScale));

    // ✅ Fix: Append Y-axis label properly
    g.append("text")
      .attr("x", -chartHeight / 2)
      .attr("y", -50) // Adjust position
      .attr("transform", "rotate(-90)")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text(labelY);

    // ✅ Fix: Append X-axis label properly
    g.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 40) // Adjust position
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .text("Time");

    // Clip path for zooming
    g.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    const lineGroup = g.append("g").attr("clip-path", "url(#clip)");

    // ✅ Fix: Tooltip should only be created once
    let tooltip = d3.select("#tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("id", "tooltip") as unknown as d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
    }
    tooltip.style("position", "absolute").style("background", "white").style("padding", "5px").style("border", "1px solid black").style("border-radius", "5px").style("display", "none");

    const colorKeys = Object.keys(colors);

    series.forEach((s, i) => {
      const line = d3.line<DataPoint>()
        .x((d) => xScale(new Date(d.timestamp * 1000)))
        .y((d) => yScale(d.value))
        .curve(d3.curveMonotoneX);

      const colorCategory = colorKeys[i % colorKeys.length] as keyof typeof colors;
      const strokeColor = colors[colorCategory][0];

      lineGroup
        .append("path")
        .datum(s.data)
        .attr("fill", "none")
        .attr("stroke", strokeColor)
        .attr("stroke-width", 2)
        .attr("d", line)
        .on("mouseover", () => {
          tooltip.style("background", strokeColor).style("display", "block").text(s.name);
        })
        .on("mousemove", (event) => {
          tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY}px`);
        })
        .on("mouseout", () => {
          tooltip.style("display", "none");
        });
    });

    // ✅ Fix: Correct zoom implementation
    const zoom = d3.zoom()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [chartWidth, chartHeight],
      ])
      .on("zoom", (event) => {
        const newXScale = event.transform.rescaleX(xScale);
        xAxis.call(d3.axisBottom(newXScale).tickFormat(d3.timeFormat("%H:%M:%S") as any));

        lineGroup.selectAll("path").attr("d", (_, i) => {
          const line = d3.line<DataPoint>()
            .x((d) => newXScale(new Date(d.timestamp * 1000)))
            .y((d) => yScale(d.value))
            .curve(d3.curveMonotoneX);
          return line(series[i].data);
        });
      });

    svg.call(zoom as any);

    svg.on("dblclick", () => {
      svg.transition().duration(500).call(zoom.transform as any, d3.zoomIdentity);
    });
  }, [width, height, series, xScale, yScale]);

  return <svg ref={ref}></svg>;
};

export default TimeSeriesLineChart;
