
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { createScales } from './chart/AssetChartScales';
import { createAxes } from './chart/AssetChartAxes';
import { createBars } from './chart/AssetChartBars';
import { setupTooltip } from './chart/AssetChartTooltip';

interface AssetData {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
}

interface AssetChartRendererProps {
  data: AssetData[];
}

export const AssetChartRenderer = ({ data }: AssetChartRendererProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
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
    
    // Create scales
    const { x, y } = createScales(data, width, height);
    
    // Create axes
    createAxes(svg, x, y, width, height);
    
    // Create bars
    createBars(svg, data, x, y);
    
    // Setup tooltip
    setupTooltip(svg, data, x);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .style("font-size", "14px")
      .text("Profit/Loss by Asset");
    
  }, [data]);
  
  return <svg ref={svgRef} width="100%" height="100%" />;
};
