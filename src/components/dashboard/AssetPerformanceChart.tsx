
import { useRef, useEffect, useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Symbol } from '@/lib/types';
import * as d3 from 'd3';

interface AssetPerformanceChartProps {
  data: Symbol[];
  className?: string;
}

export const AssetPerformanceChart = ({ data, className }: AssetPerformanceChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalPL - a.totalPL)
      .map(item => ({
        name: item.name,
        pnl: item.totalPL,
        trades: item.tradesCount,
        winRate: item.winRate
      }));
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || sortedData.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, width])
      .padding(0.4);
    
    // Find min and max profit for Y scale
    const maxPnl = d3.max(sortedData, d => d.pnl) || 0;
    const minPnl = d3.min(sortedData, d => d.pnl) || 0;
    const padding = Math.max(Math.abs(maxPnl), Math.abs(minPnl)) * 0.1;
    
    // Y scale (ensure 0 is included)
    const y = d3.scaleLinear()
      .domain([Math.min(0, minPnl - padding), Math.max(0, maxPnl + padding)])
      .range([height, 0]);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${y(0)})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
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
    
    // Add bars
    svg.selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.name) || 0)
      .attr("y", d => d.pnl >= 0 ? y(d.pnl) : y(0))
      .attr("width", x.bandwidth())
      .attr("height", d => Math.abs(y(d.pnl) - y(0)))
      .attr("fill", d => d.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))")
      .attr("rx", 4); // Rounded corners
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .style("font-size", "14px")
      .text("Profit/Loss by Asset");
    
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
      .on("mouseover", function(event, d) {
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
      });
      
  }, [sortedData]);

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Asset Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          <svg ref={svgRef} width="100%" height="100%" />
        </div>
      </div>
    </MountTransition>
  );
};
