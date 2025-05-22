import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface PolarChartProps {
  width?: number;
  height?: number;
  data: CategoryPolar[] | undefined;
}

export type CategoryPolar= {
  category: string;
  value: number;
};

const PolarChart: React.FC<PolarChartProps> = ({
  width = 400,
  height = 400,
  data,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if(!data) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous chart

    // const data: Category[] = [
    //   { category: 'A', value: 80 },
    //   { category: 'B', value: 55 },
    //   { category: 'C', value: 90 },
    // ];

    const categories = data.map((d) => d.category);
    // const values = data.map(d => d.value);

    const maxValue = 100;
    const numAxes = categories.length;
    const radius = Math.min(width, height) / 2 - 50;
    const angleSlice = (Math.PI * 2) / numAxes;

    const scale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Draw grid lines (concentric circles)
    [20, 40, 60, 80, 100].forEach((level) => {
      g.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', scale(level))
        .style('fill', 'none')
        .style('stroke', '#ddd');
    });

    // Draw axes
    categories.forEach((category, i) => {
      const x = Math.cos(angleSlice * i - Math.PI / 2) * radius;
      const y = Math.sin(angleSlice * i - Math.PI / 2) * radius;

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', y)
        .style('stroke', '#aaa');

      g.append('text')
        .attr('x', x * 1.1)
        .attr('y', y * 1.1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .text(category);
    });

    // Create data points
    const pathData = data.map((d, i) => {
      const x = Math.cos(angleSlice * i - Math.PI / 2) * scale(d.value);
      const y = Math.sin(angleSlice * i - Math.PI / 2) * scale(d.value);
      return [x, y];
    });

    // Close the shape
    pathData.push(pathData[0]);

    // Draw polygon
    g.append('polygon')
      .datum(pathData)
      .attr('points', (d) => d.map((p) => p.join(',')).join(' '))
      .style('fill', 'rgba(0, 100, 255, 0.4)')
      .style('stroke', 'blue')
      .style('stroke-width', 2);

    // Draw data points
    g.selectAll('.circle-data-point')
      .data(pathData)
      .enter()
      .append('circle')
      .attr('cx', (d) => d[0])
      .attr('cy', (d) => d[1])
      .attr('r', 5)
      .style('fill', 'red')
      .style('stroke', '#fff')
      .style('stroke-width', 2);
  }, [width, height, data]);

  return <svg ref={ref}></svg>;
};

export default PolarChart;
