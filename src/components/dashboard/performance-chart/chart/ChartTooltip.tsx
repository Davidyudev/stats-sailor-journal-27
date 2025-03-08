
import * as d3 from 'd3';
import { useEffect } from 'react';

export interface TooltipData {
  date: string;
  profit: number;
  accumulatedProfit: number;
}

export const createTooltip = () => {
  return d3.select("body")
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
};

export const showTooltip = (tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>, event: MouseEvent, data: TooltipData) => {
  tooltip
    .style("opacity", 1)
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY - 10}px`)
    .html(`
      <div>Date: ${data.date}</div>
      <div>Daily P/L: ${data.profit >= 0 ? "+" : ""}${data.profit.toFixed(2)}</div>
      <div>Accumulated P/L: ${data.accumulatedProfit >= 0 ? "+" : ""}${data.accumulatedProfit.toFixed(2)}</div>
    `);
};

export const hideTooltip = (tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>) => {
  tooltip.style("opacity", 0);
};
