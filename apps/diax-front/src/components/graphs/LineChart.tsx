import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  timestamp: number;
  value: number;
}

export interface LineSeries {
  name: string;
  data: DataPoint[];
}

interface TimeSeriesLineChartProps {
  series: LineSeries[] | undefined;
  labelY: string;
}

const colors = [
  '#3366D6',
  '#BE53C4',
  '#FB4826',
  '#1EC828',
  '#23C897',
  '#4285F4',
  '#E585EB',
  '#F9674D',
  '#4BE354',
  '#41E6B5',
];

const TimeSeriesLineChart: React.FC<TimeSeriesLineChartProps> = ({
  series,
  labelY,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!series || !svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll('*').remove(); // Clear previous render

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const svg = svgElement
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Flatten all data points
    const allData = series.flatMap((s) => s.data);
    const xExtent = d3.extent(allData, (d) => new Date(d.timestamp)) as [
      Date,
      Date
    ];
    const yMax = d3.max(allData, (d) => Number(d.value?.toFixed(2))) ?? 0;

    const xScale = d3.scaleTime().domain(xExtent).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, yMax]).range([height, 0]);

    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('font-size', '10px')
      .call(d3.axisBottom(xScale));

    xAxis
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('transform', `rotate(-90)`)
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(labelY);

    // Add clip path
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    const chartArea = svg.append('g').attr('clip-path', 'url(#clip)');

    const line = d3
      .line<DataPoint>()
      .x((d) => xScale(new Date(d.timestamp)))
      .y((d) => yScale(d.value));

    series.forEach((s, i) => {
      chartArea
        .append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', colors[i % colors.length])
        .attr('stroke-width', 2)
        .attr('class', `line-${i}`)
        .attr('d', line);
    });

  }, [series, labelY]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '400px', background: 'transparent' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TimeSeriesLineChart;
