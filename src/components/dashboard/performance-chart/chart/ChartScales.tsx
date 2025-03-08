
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

  // Extract daily and accumulated values
  const dailyValues = data.map(item => item.profit || 0);
  const accumulatedValues = data.map(item => item.accumulatedProfit || 0);

  // Min/max for daily P/L
  const minDailyValue = d3.min(dailyValues)!;  // "!" asserts not undefined
  const maxDailyValue = d3.max(dailyValues)!;
  // Always include 0 in the daily domain
  const yMin = Math.min(minDailyValue, 0) * 1.1; // add padding
  const yMax = Math.max(maxDailyValue, 0) * 1.1; // add padding

  // Y scale for daily P/L (left axis)
  const yDaily = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  // Zero line in daily scale
  const zeroY = yDaily(0);

  // Min/max for accumulated P/L, also always include 0
  const accMin = Math.min(d3.min(accumulatedValues)!, 0) * 1.1; 
  const accMax = Math.max(d3.max(accumulatedValues)!, 0) * 1.1;

  const yAccumulated = d3.scaleLinear()
    .domain([accMin, 0, accMax])
    .range([height, zeroY, 0]);

  return { x, yDaily, yAccumulated, zeroY };
};
