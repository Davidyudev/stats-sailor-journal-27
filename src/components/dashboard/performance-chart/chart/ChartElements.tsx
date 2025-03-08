
import * as d3 from 'd3';

export interface ChartElementsProps {
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: any[];
  x: d3.ScaleBand<string>;
  yDaily: d3.ScaleLinear<number, number>;
  yAccumulated: d3.ScaleLinear<number, number>;
}

export const drawBars = ({ svg, data, x, yDaily }: ChartElementsProps) => {
  // Add daily P/L bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.date) || 0)
    .attr("y", d => d.profit >= 0 ? yDaily(d.profit) : yDaily(0))
    .attr("width", x.bandwidth())
    .attr("height", d => {
      return Math.abs(yDaily(d.profit) - yDaily(0));
    })
    .attr("fill", d => d.profit >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))")
    .attr("rx", 4); // Rounded corners
};

export const drawLine = ({ svg, data, x, yAccumulated }: ChartElementsProps) => {
  // Add accumulated P/L line
  const line = d3.line<any>()
    .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
    .y(d => yAccumulated(d.accumulatedProfit))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#0EA5E9")
    .attr("stroke-width", 3)
    .attr("d", line);
};

export const drawDots = ({ svg, data, x, yAccumulated }: ChartElementsProps) => {
  // Add dots for accumulated P/L data points
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
    .attr("cy", d => yAccumulated(d.accumulatedProfit))
    .attr("r", 3)
    .attr("fill", "#0EA5E9");
};
