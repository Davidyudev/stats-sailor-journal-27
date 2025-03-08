
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
  
  const result = [];
  
  // Calculate accumulated value starting from zero
  let accumulated = 0;
  
  if (sortedData.length > 0) {
    // Start with a zero point that matches the first date (or day before)
    result.push({
      date: sortedData[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: 0,
      accumulatedProfit: 0,
      trades: 0,
      winRate: 0
    });
  }
  
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
