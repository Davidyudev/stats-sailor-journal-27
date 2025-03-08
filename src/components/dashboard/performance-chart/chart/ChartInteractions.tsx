
import * as d3 from 'd3';
import { TooltipData, showTooltip, hideTooltip } from './ChartTooltip';

export interface ChartInteractionsProps {
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  data: any[];
  x: d3.ScaleBand<string>;
  width: number;
  height: number;
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
}

export const setupInteractions = ({ svg, data, x, width, height, tooltip }: ChartInteractionsProps) => {
  // Create overlay for tooltip
  svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height)
    .style("opacity", 0)
    .on("mousemove", function(event) {
      const [xPos] = d3.pointer(event);
      const xValue = xPos;
      const xPositions = data.map((d) => (x(d.date) || 0) + x.bandwidth() / 2);
      const closest = xPositions.reduce((a, b) => {
        return Math.abs(b - xValue) < Math.abs(a - xValue) ? b : a;
      });
      const index = xPositions.indexOf(closest);
      
      if (index >= 0 && index < data.length) {
        const d = data[index];
        
        const tooltipData: TooltipData = {
          date: d.date,
          profit: d.profit,
          accumulatedProfit: d.accumulatedProfit
        };
        
        showTooltip(tooltip, event as unknown as MouseEvent, tooltipData);
        
        // Highlight current data point
        svg.selectAll(".dot")
          .attr("r", (_, i) => i === index ? 6 : 3);
        
        svg.selectAll(".bar")
          .attr("opacity", (_, i) => i === index ? 1 : 0.7);
      }
    })
    .on("mouseout", function() {
      hideTooltip(tooltip);
      svg.selectAll(".dot").attr("r", 3);
      svg.selectAll(".bar").attr("opacity", 1);
    });
};
