
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

  // If the accumulated domain actually crosses 0, we can use
  // a piecewise domain to anchor 0 exactly at zeroY.
  //
  // Domain has 3 points: [accMin, 0, accMax]
  // Range has 3 points:  [height, zeroY, 0]
  //   =>  accMin -> bottom of chart
  //       0       -> zeroY (aligned with daily's zero)
  //       accMax  -> top of chart
  //
  // If accMin == 0 or accMax == 0 (all data is positive or negative),
  // this still includes 0 but effectively collapses part of the domain.
  // That's okay for alignment, but feel free to add conditionals
  // if you want different behavior for strictly positive or negative data.
  const yAccumulated = d3.scaleLinear()
    .domain([accMin, 0, accMax])
    .range([height, zeroY, 0]);

  return { x, yDaily, yAccumulated, zeroY };
};
