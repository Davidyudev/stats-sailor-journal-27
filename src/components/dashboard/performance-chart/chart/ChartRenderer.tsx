
import { useEffect } from 'react';
import * as d3 from 'd3';
import { createScales } from './ChartScales';
import { drawAxes, drawGridLines } from './ChartAxes';
import { drawBars, drawLine, drawDots } from './ChartElements';
import { setupInteractions } from './ChartInteractions';
import { createTooltip } from './ChartTooltip';

interface ChartRendererProps {
  svgRef: React.RefObject<SVGSVGElement>;
  data: any[];
}

export const ChartRenderer = ({ svgRef, data }: ChartRendererProps) => {
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Chart dimensions
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const { x, yDaily, yAccumulated, zeroY } = createScales(data, width, height);
    
    // Draw axes and grid lines
    drawAxes({ svg, x, yDaily, yAccumulated, width, height, zeroY });
    drawGridLines({ svg, x, yDaily, yAccumulated, width, height, zeroY });
    
    // Draw chart elements
    drawBars({ svg, data, x, yDaily, yAccumulated });
    drawLine({ svg, data, x, yDaily, yAccumulated });
    drawDots({ svg, data, x, yDaily, yAccumulated });
    
    // Add tooltip and interactions
    const tooltip = createTooltip();
    setupInteractions({ svg, data, x, width, height, tooltip });
    
    // Cleanup tooltip on unmount
    return () => {
      if (tooltip) {
        tooltip.remove();
      }
    };
  }, [svgRef, data]);
  
  return null;
};
