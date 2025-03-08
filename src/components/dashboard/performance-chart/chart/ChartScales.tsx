
import * as d3 from 'd3';

export interface ChartScalesResult {
  x: d3.ScaleBand<string>;
  yDaily: d3.ScaleLinear<number, number>;
  yAccumulated: d3.ScaleLinear<number, number>;
}

export const createScales = (
  data: any[], 
  width: number, 
  height: number
): ChartScalesResult => {
  // X scale
  const x = d3.scaleBand()
    .domain(data.map(d => d.date))
    .range([0, width])
    .padding(0.4);
  
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
  
  // Y scales - one for daily P/L (left) and one for accumulated P/L (right)
  // Using the same domain for both scales would make them hard to read
  // Instead, we'll make sure both scales have 0 at the same position
  const yDaily = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);
  
  const zeroPosition = yDaily(0); // Get the pixel position for zero in the daily scale
  
  // Create accumulated scale that maps zero to the same pixel position
  const yAccumulated = d3.scaleLinear()
    .domain([accMin, accMax])
    .range([height, 0])
    .nice();
  
  // Calculate what range values would put zero at the same position
  const accZeroPosition = yAccumulated(0);
  
  if (accZeroPosition !== zeroPosition && (accMin < 0 && accMax > 0)) {
    // Adjust the range so zero aligns for both scales
    const accRange = [
      height,
      height - (height * (accMax / (accMax - accMin)))
    ];
    
    if (!isNaN(accRange[0]) && !isNaN(accRange[1])) {
      yAccumulated.range(accRange);
    }
  }
    
  return { x, yDaily, yAccumulated };
};
