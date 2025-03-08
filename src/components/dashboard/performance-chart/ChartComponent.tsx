
import { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface ChartComponentProps {
  data: any[];
}

export const ChartComponent = ({ data }: ChartComponentProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Chart dimensions
    const margin = { top: 20, right: 80, bottom: 40, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;
    
    // Find maximum values for scaling
    const maxAccumulated = Math.max(...data.map(item => item.accumulatedProfit || 0));
    const minAccumulated = Math.min(...data.map(item => item.accumulatedProfit || 0));
    const dailyValues = data.map(item => item.profit || 0);
    const minDailyValue = Math.min(...dailyValues);
    const maxDailyValue = Math.max(...dailyValues);
    
    // Calculate the daily range for proper scaling
    const dailyRange = Math.max(Math.abs(minDailyValue), Math.abs(maxDailyValue));
    
    // Calculate dynamic min/max for daily P/L based on data distribution
    let yMin = minDailyValue - (dailyRange * 0.1); // Add 10% padding
    let yMax = maxDailyValue + (dailyRange * 0.1); // Add 10% padding
    
    // Always ensure 0 is included in the range for daily P/L
    yMin = Math.min(yMin, 0);
    yMax = Math.max(yMax, 0);
    
    // For accumulated P/L, always ensure 0 is included
    const accMin = Math.min(minAccumulated * 1.1, 0);
    const accMax = Math.max(maxAccumulated * 1.1, 0);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.4);
    
    // Y scales - one for daily P/L (left) and one for accumulated P/L (right)
    const yDaily = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);
    
    const yAccumulated = d3.scaleLinear()
      .domain([accMin, accMax])
      .range([height, 0]);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(0)
        .tickPadding(10))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("fill", "hsl(var(--foreground))")
      .style("font-size", "10px");
    
    // Add Y axis for daily P/L
    const yDailyAxis = svg.append("g")
      .call(d3.axisLeft(yDaily)
        .tickSize(-width)
        .tickPadding(10))
      .style("color", "hsl(var(--foreground))")
      .style("font-size", "10px");
    
    yDailyAxis.selectAll(".tick line")
      .attr("stroke", "hsl(var(--chart-grid))")
      .attr("stroke-dasharray", "4");
    
    yDailyAxis.selectAll(".domain").attr("stroke", "hsl(var(--foreground))");
    
    // Add Y axis for accumulated P/L
    const yAccAxis = svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yAccumulated)
        .tickSize(0)
        .tickPadding(10))
      .style("color", "#0EA5E9")
      .style("font-size", "10px");
    
    yAccAxis.selectAll(".domain").attr("stroke", "#0EA5E9");
    
    // Add axis titles
    svg.append("text")
      .attr("x", -margin.left + 10)
      .attr("y", -10)
      .style("fill", "hsl(var(--foreground))")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Daily P/L");
    
    svg.append("text")
      .attr("x", width + 10)
      .attr("y", -10)
      .style("fill", "#0EA5E9")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text("Accumulated");
    
    // Add a horizontal line at y=0 for daily P/L
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yDaily(0))
      .attr("y2", yDaily(0))
      .attr("stroke", "hsl(var(--foreground))")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4");
    
    // Add a horizontal line at y=0 for accumulated P/L if it's within the visible range
    if (accMin <= 0 && accMax >= 0) {
      svg.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yAccumulated(0))
        .attr("y2", yAccumulated(0))
        .attr("stroke", "#0EA5E9")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4");
    }
    
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
    
    // Add tooltip functionality
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
    
    // Create overlay for tooltip
    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 0)
      .on("mousemove", function(event) {
        const [xPos] = d3.pointer(event);
        const bisect = d3.bisector((d: any) => x(d.date) || 0).left;
        const xValue = xPos;
        const xPositions = data.map((d) => (x(d.date) || 0) + x.bandwidth() / 2);
        const closest = xPositions.reduce((a, b) => {
          return Math.abs(b - xValue) < Math.abs(a - xValue) ? b : a;
        });
        const index = xPositions.indexOf(closest);
        
        if (index >= 0 && index < data.length) {
          const d = data[index];
          
          tooltip
            .style("opacity", 1)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`)
            .html(`
              <div>Date: ${d.date}</div>
              <div>Daily P/L: ${d.profit >= 0 ? "+" : ""}${d.profit.toFixed(2)}</div>
              <div>Accumulated P/L: ${d.accumulatedProfit >= 0 ? "+" : ""}${d.accumulatedProfit.toFixed(2)}</div>
            `);
          
          // Highlight current data point
          svg.selectAll(".dot")
            .attr("r", (_, i) => i === index ? 6 : 3);
          
          svg.selectAll(".bar")
            .attr("opacity", (_, i) => i === index ? 1 : 0.7);
        }
      })
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
        svg.selectAll(".dot").attr("r", 3);
        svg.selectAll(".bar").attr("opacity", 1);
      });
      
  }, [data]);
  
  return (
    <div className="h-64 w-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};
