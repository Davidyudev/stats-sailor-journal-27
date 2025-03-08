
import { useRef, useEffect, useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import * as d3 from 'd3';

interface DurationPerformanceChartProps {
  trades: Trade[];
  className?: string;
}

export const DurationPerformanceChart = ({ trades, className }: DurationPerformanceChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const tradeItems = useMemo(() => {
    return trades.map(trade => {
      const durationHours = (trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60);
      return {
        x: parseFloat(durationHours.toFixed(2)),
        y: trade.profitLoss,
        symbol: trade.symbol,
        duration: durationHours
      };
    });
  }, [trades]);

  useEffect(() => {
    if (!svgRef.current || tradeItems.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Find data extents
    const xExtent = d3.extent(tradeItems, d => d.x) as [number, number];
    const yExtent = d3.extent(tradeItems, d => d.y) as [number, number];
    
    // Add padding to ranges
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const yPadding = Math.max(Math.abs(yExtent[0]), Math.abs(yExtent[1])) * 0.1;
    
    // X scale
    const x = d3.scaleLinear()
      .domain([Math.max(0, xExtent[0] - xPadding), xExtent[1] + xPadding])
      .range([0, width]);
    
    // Y scale (ensure 0 is included)
    const y = d3.scaleLinear()
      .domain([Math.min(0, yExtent[0] - yPadding), Math.max(0, yExtent[1] + yPadding)])
      .range([height, 0]);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("fill", "hsl(var(--foreground))")
      .style("font-size", "12px");
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .text("Duration (hours)");
    
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
    
    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .text("Profit/Loss");
    
    // Add a horizontal line at y=0
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", "hsl(var(--foreground))")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.5);
    
    // Add dots
    svg.selectAll(".dot")
      .data(tradeItems)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 5)
      .attr("fill", d => d.y >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))")
      .attr("stroke", "hsl(var(--foreground))")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7);
    
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
    svg.selectAll(".dot")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 8)
          .attr("opacity", 1);
        
        const durationText = d.duration < 1 
          ? `${Math.round(d.duration * 60)} minutes` 
          : `${d.duration.toFixed(1)} hours`;
        
        tooltip
          .style("opacity", 1)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 20}px`)
          .html(`
            <div><strong>${d.symbol}</strong></div>
            <div>P/L: ${d.y >= 0 ? "+" : ""}${d.y.toFixed(2)}</div>
            <div>Duration: ${durationText}</div>
          `);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 5)
          .attr("opacity", 0.7);
        tooltip.style("opacity", 0);
      });
      
  }, [tradeItems]);

  return (
    <MountTransition delay={250} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Trade Duration vs P/L</h3>
        </div>
        
        <div className="h-72 w-full">
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
      </div>
    </MountTransition>
  );
};
