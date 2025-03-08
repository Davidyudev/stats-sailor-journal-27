
import { useState, useEffect } from 'react';
import { Trade, DailyPerformance, Symbol } from '@/lib/types';

export type TimePeriod = 'all' | '1m' | '3m' | '6m' | '1y' | 'this-month' | 'this-week';

export const useTimePeriodFilter = (
  trades: Trade[],
  performance: DailyPerformance[],
  symbols: Symbol[]
) => {
  // Change default to "this-month" instead of "all"
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('this-month');

  // Filter trades based on selected time period
  const filteredTrades = (() => {
    if (selectedTimePeriod === 'all') {
      // Make sure to return ALL trades without filtering when 'all' is selected
      return [...trades].sort((a, b) => a.closeDate.getTime() - b.closeDate.getTime());
    }
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(selectedTimePeriod) {
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
    
    return trades
      .filter(trade => trade.closeDate >= cutoffDate)
      .sort((a, b) => a.closeDate.getTime() - b.closeDate.getTime());
  })();

  // Filter symbols based on time period
  const filteredSymbols = (() => {
    // Create a map of symbols with reset performance data
    const symbolMap = new Map();
    symbols.forEach(symbol => {
      symbolMap.set(symbol.name, {
        ...symbol,
        tradesCount: 0,
        winRate: 0,
        totalPL: 0,
        averagePips: 0
      });
    });
    
    // Update the symbols with data from filtered trades
    filteredTrades.forEach(trade => {
      const symbol = symbolMap.get(trade.symbol);
      if (symbol) {
        symbol.tradesCount += 1;
        symbol.totalPL += trade.profitLoss;
      }
    });
    
    // Calculate win rates for filtered data
    symbolMap.forEach(symbol => {
      if (symbol.tradesCount > 0) {
        const symbolTrades = filteredTrades.filter(t => t.symbol === symbol.name);
        const winningTrades = symbolTrades.filter(t => t.profitLoss > 0);
        symbol.winRate = symbolTrades.length > 0 
          ? parseFloat(((winningTrades.length / symbolTrades.length) * 100).toFixed(1))
          : 0;
        symbol.averagePips = symbolTrades.length > 0
          ? parseFloat((symbolTrades.reduce((sum, t) => sum + t.pips, 0) / symbolTrades.length).toFixed(1))
          : 0;
      }
    });
    
    return Array.from(symbolMap.values())
      .filter(symbol => symbol.tradesCount > 0);
  })();

  // Filter performance data based on time period
  const filteredPerformance = (() => {
    if (selectedTimePeriod === 'all') {
      // Make sure to return ALL performance data without filtering when 'all' is selected 
      return [...performance].sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch(selectedTimePeriod) {
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
    
    return performance
      .filter(item => item.date >= cutoffDate)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  })();

  return {
    selectedTimePeriod,
    setSelectedTimePeriod,
    filteredTrades,
    filteredSymbols,
    filteredPerformance
  };
};
