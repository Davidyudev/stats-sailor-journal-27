
import { DailyPerformance } from '@/lib/types';
import { TimePeriod } from '@/hooks/useTimePeriodFilter';

export const filterDataByTimePeriod = (data: DailyPerformance[], timePeriod: TimePeriod): DailyPerformance[] => {
  if (timePeriod === 'all') {
    // Return all data sorted by date
    return [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  const now = new Date();
  let cutoffDate = new Date();
  
  switch(timePeriod) {
    case '1m': 
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case '3m': 
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case '6m': 
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case '1y': 
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'this-month':
      // Set to first day of current month
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'this-week':
      // Set to Monday of current week
      const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
      const diff = day === 0 ? 6 : day - 1; // Adjust to make Monday the first day
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - diff);
      cutoffDate.setHours(0, 0, 0, 0);
      break;
  }
  
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
