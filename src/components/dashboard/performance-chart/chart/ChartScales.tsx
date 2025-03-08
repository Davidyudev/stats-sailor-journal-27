
import * as d3 from 'd3';

export interface ChartScalesResult {
  x: d3.ScaleBand<string>;
  yDaily: d3.ScaleLinear<number, number>;
  yAccumulated: d3.ScaleLinear<number, number>;
  zeroY: number; // Add zeroY to track the zero position
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
  
  // Y scale for daily P/L (left)
  const yDaily = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);
  
  // Calculate the position of zero on the daily scale
  const zeroY = yDaily(0);
  
  // Calculate the range percentages for accumulated scale to align with daily scale
  const accumulatedDomain = [accMin, accMax];
  const zeroPercent = (0 - accMin) / (accMax - accMin);
  
  // Y scale for accumulated P/L (right) - align zero with daily scale
  const yAccumulated = d3.scaleLinear()
    .domain(accumulatedDomain)
    .range([height - (height * (1 - zeroPercent)), height * zeroPercent]);
    
  return { x, yDaily, yAccumulated, zeroY };
};
