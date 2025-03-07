
import { useState } from 'react';
import { Trade, DailyPerformance, Symbol } from '@/lib/types';

export type TimePeriod = 'all' | '1m' | '3m' | '6m' | '1y';

export const useTimePeriodFilter = (
  trades: Trade[],
  performance: DailyPerformance[],
  symbols: Symbol[]
) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('all');

  // Filter trades based on selected time period
  const filteredTrades = (() => {
    if (selectedTimePeriod === 'all') return trades;
    
    const now = new Date();
    let monthsToSubtract = 0;
    
    switch(selectedTimePeriod) {
      case '1m': monthsToSubtract = 1; break;
      case '3m': monthsToSubtract = 3; break;
      case '6m': monthsToSubtract = 6; break;
      case '1y': monthsToSubtract = 12; break;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
    
    return trades.filter(trade => trade.closeDate >= cutoffDate);
  })();

  // Filter symbols based on time period
  const filteredSymbols = (() => {
    if (selectedTimePeriod === 'all') return symbols;
    
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
    if (selectedTimePeriod === 'all') return performance;
    
    const now = new Date();
    let monthsToSubtract = 0;
    
    switch(selectedTimePeriod) {
      case '1m': monthsToSubtract = 1; break;
      case '3m': monthsToSubtract = 3; break;
      case '6m': monthsToSubtract = 6; break;
      case '1y': monthsToSubtract = 12; break;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
    
    return performance.filter(item => item.date >= cutoffDate);
  })();

  return {
    selectedTimePeriod,
    setSelectedTimePeriod,
    filteredTrades,
    filteredSymbols,
    filteredPerformance
  };
};
