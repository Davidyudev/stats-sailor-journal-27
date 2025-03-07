
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
  
  // Always create an initial zero point data entry
  const result = [];
  
  // Add a starting point with 0 value regardless of data presence
  // This ensures the chart always starts from 0
  if (sortedData.length > 0) {
    const firstDay = sortedData[0];
    // Add a data point for the day before the first day to start accumulation at 0
    const startDate = new Date(firstDay.date);
    startDate.setDate(startDate.getDate() - 1);
    
    result.push({
      date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: 0,
      accumulatedProfit: 0,
      trades: 0,
      winRate: 0
    });
  }
  
  let accumulated = 0;
  sortedData.forEach(item => {
    accumulated += item.profitLoss;
    result.push({
      date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: item.profitLoss,
      accumulatedProfit: accumulated,
      trades: item.trades,
      winRate: item.winRate
    });
  });
  
  return result;
};

export const calculateTotalProfit = (filteredData: DailyPerformance[]): number => {
  return filteredData.reduce((sum, item) => sum + item.profitLoss, 0);
};
