import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

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

const colorKeys = Object.keys(colors);

const getColor = (d: d3.HierarchyRectangularNode<ChartNode>) => {
  if (d.depth === 0) return "white"; // Root node is white
  let parentIndex = 0;
  if (d.parent && d.parent.parent) {
    parentIndex = d.parent.parent?.children?.indexOf(d.parent) ?? 0;
  } else if (d.parent) {
    parentIndex = d.parent?.children?.indexOf(d) ?? 0;
  }
  const colorKey = colorKeys[parentIndex % colorKeys.length] as keyof typeof colors;
  return colors[colorKey][Math.min(d.depth - 1, colors[colorKey].length - 1)];
};

const MultiLayerPieChart: React.FC<PieChartProps> = ({
  width = 400,
  height = 400,
  data,
}) => {
  
// data = {
//   name: "Root",
//   children: [
//     {
//       name: "Category A",
//       children: [
//         { name: "A1", value: 100 },
//         { name: "A2", value: 200 },
//       ],
//     },
//     {
//       name: "Category B",
//       children: [
//         { name: "B1", value: 150 },
//         { name: "B2", value: 250 },
//       ],
//     },
//     {
//       name: "Category C",
//       children: [
//         { name: "C1", value: 120 },
//         { name: "C2", value: 180 },
//         { name: "C3", value: 180 },
//       ],
//     },
//   ],
// };

  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height) / 2;
    const partition = d3.partition<ChartNode>().size([2 * Math.PI, radius]);
    const root = d3.hierarchy<ChartNode>(data).sum((d) => d.value || 0);
    partition(root);
    const totalValue = root.value || 1;

    const arc = d3
      .arc<d3.HierarchyRectangularNode<ChartNode>>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1);

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "5px")
      .style("border", "1px solid black")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    g.selectAll("path")
      .data(root.descendants())
      .enter()
      .append("path")
      .attr("d", arc as any)
      .style("fill", (d) => getColor(d as d3.HierarchyRectangularNode<ChartNode>))
      .style("stroke", "#fff")
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.7);
        tooltip.style("opacity", 1);
        tooltip.style("background", getColor(d as d3.HierarchyRectangularNode<ChartNode>));
        tooltip
          .html(
            `${d.data.name}: ${d.value || 0} (${(
              ((d.value || 0) / totalValue) *
              100
            ).toFixed(1)}%)`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).style("opacity", 1);
        tooltip.style("opacity", 0);
      })
  

    return () => {
      tooltip.remove();
    };
  }, [width, height, data]);

  return <svg ref={ref}></svg>;
};

export default MultiLayerPieChart;
