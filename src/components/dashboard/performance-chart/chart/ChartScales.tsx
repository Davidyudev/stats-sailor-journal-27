
import * as d3 from 'd3';

export interface ChartScalesResult {
  x: d3.ScaleBand<string>;
  yDaily: d3.ScaleLinear<number, number>;
  yAccumulated: d3.ScaleLinear<number, number>;
  zeroY: number;
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
  
  // Extract values
  const dailyValues = data.map(item => item.profit || 0);
  const accumulatedValues = data.map(item => item.accumulatedProfit || 0);
  
  const minDailyValue = Math.min(...dailyValues);
  const maxDailyValue = Math.max(...dailyValues);
  const minAccumulated = Math.min(...accumulatedValues);
  const maxAccumulated = Math.max(...accumulatedValues);

  // Ensure zero is within the domain and apply padding
  const dailyRange = Math.max(Math.abs(minDailyValue), Math.abs(maxDailyValue));
  const yMin = Math.min(minDailyValue - dailyRange * 0.1, 0);
  const yMax = Math.max(maxDailyValue + dailyRange * 0.1, 0);

  // Y scale for daily P/L (left)
  const yDaily = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  // Calculate the zero position
  const zeroY = yDaily(0);

  // Ensure zero is also in the accumulated domain
  const accMin = Math.min(minAccumulated, 0);
  const accMax = Math.max(maxAccumulated, 0);

  // Y scale for accumulated P/L (right), ensuring 0 aligns with zeroY
  const yAccumulated = d3.scaleLinear()
    .domain([accMin, accMax])
    .range([yDaily(accMin), yDaily(accMax)]);

  return { x, yDaily, yAccumulated, zeroY };
};
