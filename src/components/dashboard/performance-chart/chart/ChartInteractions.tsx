
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
      
      // Filter out the "Start" point for interaction purposes
      const interactiveData = data.filter(d => d.date !== "Start");
      
      // Find which bar the mouse is over directly by comparing x position with each bar
      let closestPoint = null;
      let minDistance = Infinity;
      
      for (const d of interactiveData) {
        const barX = x(d.date) || 0;
        const barWidth = x.bandwidth();
        const barCenter = barX + barWidth/2;
        const distance = Math.abs(barCenter - xPos);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = d;
        }
      }
      
      if (closestPoint) {
        const tooltipData: TooltipData = {
          date: closestPoint.date,
          profit: closestPoint.profit,
          accumulatedProfit: closestPoint.accumulatedProfit,
          trades: closestPoint.trades,
          winRate: closestPoint.winRate
        };
        
        showTooltip(tooltip, event as unknown as MouseEvent, tooltipData);
        
        // Highlight current data point
        svg.selectAll(".dot")
          .attr("r", (d) => {
            return d.date === closestPoint.date ? 6 : 3;
          });
        
        svg.selectAll(".bar")
          .attr("opacity", (d) => {
            return d.date === closestPoint.date ? 1 : 0.7;
          });
      }
    })
    .on("mouseout", function() {
      hideTooltip(tooltip);
      svg.selectAll(".dot").attr("r", 3);
      svg.selectAll(".bar").attr("opacity", 1);
    });
};
