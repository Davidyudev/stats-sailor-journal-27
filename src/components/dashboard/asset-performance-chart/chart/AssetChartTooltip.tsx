
import * as d3 from 'd3';

interface AssetData {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
}

export const setupTooltip = (
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  data: AssetData[],
  x: d3.ScaleBand<string>
) => {
  // Add tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "d3-tooltip")
    .style("position", "absolute")
    .style("background", "hsl(var(--background))")
    .style("color", "hsl(var(--foreground))")
    .style("border", "1px solid hsl(var(--border))")
    .style("border-radius", "4px")
    .style("padding", "8px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 100);
  
  // Add interaction
  svg.selectAll(".bar")
    .on("mouseover", function(event, d: AssetData) {
      d3.select(this).attr("opacity", 0.8);
      
      tooltip
        .style("opacity", 1)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`)
        .html(`
          <div><strong>${d.name}</strong></div>
          <div>P/L: ${d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}</div>
          <div>Trades: ${d.trades}</div>
          <div>Win Rate: ${d.winRate}%</div>
        `);
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip.style("opacity", 0);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 20}px`);
    });
    
  // Clean up tooltip when component unmounts
  return () => {
    tooltip.remove();
  };
};
