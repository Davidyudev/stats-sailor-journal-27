
import * as d3 from 'd3';

interface AssetData {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export const createBars = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: AssetData[],
  x: d3.ScaleBand<string>,
  y: d3.ScaleLinear<number, number>
) => {
  // Add bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.name) || 0)
    .attr("y", d => d.pnl >= 0 ? y(d.pnl) : y(0))
    .attr("width", x.bandwidth())
    .attr("height", d => Math.abs(y(d.pnl) - y(0)))
    .attr("fill", d => d.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))")
    .attr("rx", 4); // Rounded corners
};
