
import * as d3 from 'd3';

export const createAxes = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>,
  width: number,
  height: number
) => {
  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${y(0)})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle")
    .attr("dx", "0")
    .attr("dy", "1em")
    .attr("transform", "rotate(0)")  // No rotation for better readability
    .style("fill", "hsl(var(--foreground))")
    .style("font-size", "12px");
  
  // Add Y axis
  const yAxis = svg.append("g")
    .call(d3.axisLeft(y)
      .tickSize(-width)
      .tickPadding(10))
    .style("color", "hsl(var(--foreground))")
    .style("font-size", "12px");
  
  yAxis.selectAll(".tick line")
    .attr("stroke", "hsl(var(--chart-grid))")
    .attr("stroke-dasharray", "4");
  
  yAxis.selectAll(".domain").attr("stroke", "hsl(var(--foreground))");
  
  // Add a horizontal line at y=0
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(0))
    .attr("y2", y(0))
    .attr("stroke", "hsl(var(--foreground))")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.5);
};
