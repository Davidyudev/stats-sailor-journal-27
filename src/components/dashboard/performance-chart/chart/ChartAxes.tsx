
import * as d3 from 'd3';

export interface AxesProps {
  svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  x: d3.ScaleBand<string>;
  yDaily: d3.ScaleLinear<number, number>;
  yAccumulated: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
}

export const drawAxes = ({ svg, x, yDaily, yAccumulated, width, height }: AxesProps) => {
  // Add X axis with improved styling
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x)
      .tickSize(0)
      .tickPadding(10))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("fill", "hsl(var(--foreground))")
    .style("font-size", "10px")
    .style("font-weight", "500")
    // Limit the number of x-axis labels for better visual appeal
    .each(function(_, i, nodes) {
      // Only show every nth label depending on data size
      const totalLabels = nodes.length;
      const skipFactor = totalLabels > 30 ? 5 : totalLabels > 15 ? 3 : totalLabels > 7 ? 2 : 1;
      if (i % skipFactor !== 0 && i !== nodes.length - 1) { 
        d3.select(this).remove();
      }
    });

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
    .attr("x", -10)
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
};

export const drawGridLines = ({ svg, yDaily, yAccumulated, width, height }: AxesProps) => {
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
  const accMin = yAccumulated.domain()[0];
  const accMax = yAccumulated.domain()[2];
  
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
};
