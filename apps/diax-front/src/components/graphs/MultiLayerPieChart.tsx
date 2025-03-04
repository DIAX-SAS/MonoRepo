/* eslint-disable @typescript-eslint/no-explicit-any */
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

interface PieChartProps {
  width?: number;
  height?: number;
  data: ChartNode;
}

interface ChartNode {
  name: string;
  value?: number;
  children?: ChartNode[];
}

const MultiLayerPieChart: React.FC<PieChartProps> = ({
  width = 400,
  height = 400,
  data,
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous chart

    const radius = Math.min(width, height) / 2;
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create partition layout
    const partition = d3.partition<ChartNode>().size([2 * Math.PI, radius]);

    // Create hierarchy
    const root = d3.hierarchy<ChartNode>(data).sum((d) => d.value || 0);
    partition(root);

    // Compute total sum for percentage calculation
    const totalValue = root.value || 1;

    const arc = d3
      .arc<d3.HierarchyRectangularNode<ChartNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create slices
    const slices = g
      .selectAll('path')
      .data(root.descendants().slice(1)) // Exclude root node
      .enter()
      .append('path')
      .attr('d', arc as any)
      .style('fill', (d) => color(d.data.name))
      .style('stroke', '#fff')
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.7);

        // Show label on hover
        g.append('text')
          .attr('class', 'hover-label')
          .attr('transform', () => {
            const [x, y] = (arc as any).centroid(d);
            return `translate(${x}, ${y})`;
          })
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .style('fill', 'white')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .text(() => {
            const percentage = ((d.value || 0) / totalValue) * 100;
            return `${d.data.name} (${percentage.toFixed(1)}%)`;
          });
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        // Remove label on mouse out
        g.select('.hover-label').remove();
      });

  }, [width, height, data]);

  return <svg ref={ref}></svg>;
};

export default MultiLayerPieChart;
