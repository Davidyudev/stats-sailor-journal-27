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
  
  // Calculate the accumulated values first to find the initial value
  let initialValue = 0;
  let accumulated = 0;
  
  // Find the initial accumulated value after the first data point
  if (sortedData.length > 0) {
    accumulated = sortedData[0].profitLoss;
    initialValue = accumulated; // This is the value we'll subtract from all points
  }
  
  // Prepare the chart data with normalized accumulated profit
  const result = [];
  
  // Add a zero point at the beginning
  result.push({
    date: sortedData[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    profit: 0,
    accumulatedProfit: 0, // Start at exactly 0
    trades: 0,
    winRate: 0
  });
  
  // Reset accumulated to prepare for the real data points
  accumulated = 0;
  
  // Process each data point
  for (let i = 0; i < sortedData.length; i++) {
    const item = sortedData[i];
    accumulated += item.profitLoss;
    
    // Normalize the accumulated value by subtracting the initial value
    const normalizedAccumulated = accumulated - initialValue;
    
    result.push({
      date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: item.profitLoss,
      accumulatedProfit: normalizedAccumulated,
      trades: item.trades,
      winRate: item.winRate
    });
  }
  
  return result;
};

export const calculateTotalProfit = (filteredData: DailyPerformance[]): number => {
  return filteredData.reduce((sum, item) => sum + item.profitLoss, 0);
};
