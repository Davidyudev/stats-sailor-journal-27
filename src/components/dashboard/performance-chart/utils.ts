import { DailyPerformance } from '@/lib/types';
import { TimePeriod } from '@/hooks/useTimePeriodFilter';

export const filterDataByTimePeriod = (data: DailyPerformance[], timePeriod: TimePeriod): DailyPerformance[] => {
  if (timePeriod === 'all') {
    // Return all data sorted by date
    return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  const now = new Date();
  let monthsToSubtract = 0;
  
  switch(timePeriod) {
    case '1m': monthsToSubtract = 1; break;
    case '3m': monthsToSubtract = 3; break;
    case '6m': monthsToSubtract = 6; break;
    case '1y': monthsToSubtract = 12; break;
  }
  
  const cutoffDate = new Date();
  cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
  
  return data
    .filter(item => item.date >= cutoffDate)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const prepareChartData = (filteredData: DailyPerformance[]) => {
  // Make sure we sort the data by date first to ensure proper accumulation
  const sortedData = [...filteredData].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (sortedData.length === 0) {
    return [];
  }
  
  // First, let's create the chart data with proper accumulation
  let accumulated = 0;
  const rawChartData = sortedData.map(item => {
    accumulated += item.profitLoss;
    return {
      date: item.date,
      rawDate: item.date,
      profit: item.profitLoss,
      accumulatedProfit: accumulated, // This is the running total
      trades: item.trades,
      winRate: item.winRate
    };
  });
  
  // Create the final chart data
  const result = [];
  
  // Add a starting point at exactly zero (at the chart border)
  // This is a virtual point that will be positioned before the first real data point
  result.push({
    date: "Start", // Special marker for the first point
    profit: 0,
    accumulatedProfit: 0, // Start at exactly 0
    trades: 0,
    winRate: 0
  });
  
  // Add all data points with their correct accumulated profit
  rawChartData.forEach(item => {
    result.push({
      date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: item.profit,
      accumulatedProfit: item.accumulatedProfit, // Use the accumulated value directly
      trades: item.trades,
      winRate: item.winRate
    });
  });
  
  return result;
};

export const calculateTotalProfit = (filteredData: DailyPerformance[]): number => {
  return filteredData.reduce((sum, item) => sum + item.profitLoss, 0);
};
