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

  // Min/max for accumulated P/L
  const accMin = Math.min(d3.min(accumulatedValues)!, 0);
  const accMax = Math.max(d3.max(accumulatedValues)!, 0);
  
  // Calculate the proper ratio for proportional scaling
  // We want to maintain the zero position while ensuring proper proportional scaling
  const totalAccRange = Math.abs(accMin) + Math.abs(accMax);
  
  // Ensure we don't divide by zero
  if (totalAccRange === 0) {
    // Create a default scale if there's no range
    const yAccumulated = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range([height, zeroY, 0]);
    return { x, yDaily, yAccumulated, zeroY };
  }
  
  // Calculate how much of the total range is negative vs positive
  const negativeRatio = Math.abs(accMin) / totalAccRange;
  const positiveRatio = Math.abs(accMax) / totalAccRange;
  
  // Calculate the space available below and above the zero line
  const spaceBelow = height - zeroY;
  const spaceAbove = zeroY;
  
  // Calculate the properly proportioned range values
  let rangeMin, rangeMax;
  
  // If we have both positive and negative values
  if (accMin < 0 && accMax > 0) {
    // Allocate space proportionally while keeping zero at zeroY
    rangeMin = zeroY + (spaceBelow * (negativeRatio / (negativeRatio + positiveRatio)));
    rangeMax = zeroY - (spaceAbove * (positiveRatio / (negativeRatio + positiveRatio)));
  } else if (accMin >= 0) {
    // Only positive values
    rangeMin = zeroY;
    rangeMax = 0;
  } else {
    // Only negative values
    rangeMin = height;
    rangeMax = zeroY;
  }
  
  // Ensure we have some padding 
  accMin = accMin * 1.1;
  accMax = accMax * 1.1;

  const yAccumulated = d3.scaleLinear()
    .domain([accMin, 0, accMax])
    .range([rangeMin, zeroY, rangeMax]);

  return { x, yDaily, yAccumulated, zeroY };
};
