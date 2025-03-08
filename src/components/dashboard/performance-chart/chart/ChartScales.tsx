
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
  const accMin = Math.min(minAccumulated - Math.abs(minAccumulated * 0.1), 0);
  const accMax = Math.max(maxAccumulated + Math.abs(maxAccumulated * 0.1), 0);
  
  // Create the daily scale first
  const yDaily = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);
  
  // Get the position of zero on the daily scale
  const zeroPosition = yDaily(0);
  
  // Calculate the percentage position of zero in the daily scale
  const zeroPercent = (height - zeroPosition) / height;
  
  // Calculate what the range values should be for accumulated scale
  // to ensure zero is at the same position
  const accRange = [
    height, // Bottom position stays the same
    height - (height * zeroPercent) // Top position adjusted
  ];

  // Create accumulated scale with aligned zero position
  const yAccumulated = d3.scaleLinear()
    .domain([accMin, accMax])
    .range(accRange)
    .nice();
  
  return { x, yDaily, yAccumulated };
};
