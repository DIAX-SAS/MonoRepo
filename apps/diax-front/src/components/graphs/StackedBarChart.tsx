/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface StackedBarChartProps {
  width?: number;
  height?: number;
  keys: string[];
  data: Category[];
}

type Category = {
  category: string;
  motor: number;
  maquina: number;
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  width = 600,
  height = 400,
  keys,
  data,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous SVG content

    // Fallback data if empty
    const formattedData = data && data.length ? data : [{ category: 'Motor', motor: 0, maquina: 0 }];

    const stack = d3.stack<Category>().keys(keys);
    const stackedData = stack(formattedData);

    const margin = { top: 30, right: 120, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(formattedData.map((d) => d.category))
      .range([0, chartWidth])
      .padding(0.3);

    const yMax = d3.max(stackedData[stackedData.length - 1], (d) => d[1]) || 0;
    const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([chartHeight, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(keys);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw bars
    g.selectAll('.stack')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('fill', (d) => color(d.key)!)
      .selectAll('rect')
      .data((d) => d)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.data.category) ?? 0)
      .attr('y', (d) => yScale(d[1]))
      .attr('height', (d) => yScale(d[0]) - yScale(d[1]))
      .attr('width', xScale.bandwidth())
      .append('title') // Tooltip
      .text((d) => `${d.data.category}: ${d[1] - d[0]}`);

    // Add labels inside bars
    g.selectAll('.stack')
      .data(stackedData)
      .enter()
      .append('g')
      .selectAll('text')
      .data((d) => d)
      .enter()
      .append('text')
      .attr('x', (d) => (xScale(d.data.category) ?? 0) + xScale.bandwidth() / 2)
      .attr('y', (d) => (yScale(d[0]) + yScale(d[1])) / 2) // Center text vertically
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text((d) => {
        const value = d[1] - d[0];
        return value > 5 ? value : ''; // Only display if value is > 5
      });

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale));

    // Y Axis
    g.append('g').call(d3.axisLeft(yScale));

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${chartWidth + margin.left + 10}, 20)`);

    keys.forEach((key, i) => {
      const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

      legendRow.append('rect').attr('width', 15).attr('height', 15).attr('fill', color(key)!);

      legendRow.append('text').attr('x', 20).attr('y', 12).style('font-size', '12px').text(key);
    });
  }, [width, height, keys, data]);

  return <svg ref={ref}></svg>;
};

export default StackedBarChart;
