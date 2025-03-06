
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Symbol, Statistics, Trade } from '@/lib/types';
import { mockDataService } from '@/lib/services/mockDataService';

export const useFilteredStatistics = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filteredStats, setFilteredStats] = useState<Statistics | null>(null);
  const [filteredSymbols, setFilteredSymbols] = useState<Symbol[]>([]);

  const overallStats: Statistics = mockDataService.getStatistics();
  const symbols: Symbol[] = mockDataService.getSymbols();
  const trades: Trade[] = mockDataService.getTrades();

  // Extract all available tags from trades
  useEffect(() => {
    const allTags = trades
      .filter(trade => trade.tags && trade.tags.length > 0)
      .flatMap(trade => trade.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    setAvailableTags(uniqueTags);
  }, [trades]);

  // Filter statistics based on date range and tags
  useEffect(() => {
    if ((!dateRange || (!dateRange.from && !dateRange.to)) && selectedTags.length === 0) {
      setFilteredStats(overallStats);
      setFilteredSymbols(symbols);
      return;
    }

    let filteredTrades = [...trades];

    if (dateRange && dateRange.from) {
      const startDate = dateRange.from;
      const endDate = dateRange.to ? new Date(dateRange.to) : new Date();
      
      if (dateRange.to) {
        endDate.setHours(23, 59, 59, 999);
      }
      
      filteredTrades = filteredTrades.filter(trade => 
        trade.closeDate >= startDate && trade.closeDate <= endDate
      );
    }

    if (selectedTags.length > 0) {
      filteredTrades = filteredTrades.filter(trade => 
        trade.tags && trade.tags.some(tag => selectedTags.includes(tag))
      );
    }

    if (filteredTrades.length === 0) {
      const emptyStats: Statistics = {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfitLoss: 0,
        averageProfitLoss: 0,
        bestTrade: 0,
        worstTrade: 0,
        maxDrawdown: 0,
        averageDuration: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        expectancy: 0,
        longestWinningStreak: 0,
        longestLosingStreak: 0,
        totalCommission: 0,
        totalSwap: 0,
        netProfit: 0
      };
      setFilteredStats(emptyStats);
      setFilteredSymbols([]);
    } else {
      const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0);
      const losingTrades = filteredTrades.filter(trade => trade.profitLoss < 0);
      
      const totalPL = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const totalCommission = filteredTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
      const totalSwap = filteredTrades.reduce((sum, trade) => sum + (trade.swap || 0), 0);
      
      // Calculate average duration in days based on actual trade duration
      const totalDurationInMs = filteredTrades.reduce((sum, trade) => {
        const duration = trade.closeDate.getTime() - trade.openDate.getTime();
        return sum + duration;
      }, 0);
      const averageDurationInDays = (totalDurationInMs / filteredTrades.length) / (1000 * 60 * 60 * 24);
      
      // Calculate max drawdown based on cumulative equity curve
      let maxDrawdown = 0;
      let peak = 0;
      let cumulativePL = 0;
      
      // Sort trades by close date to create a time-based equity curve
      const sortedTrades = [...filteredTrades].sort((a, b) => 
        a.closeDate.getTime() - b.closeDate.getTime()
      );
      
      for (const trade of sortedTrades) {
        cumulativePL += trade.profitLoss;
        if (cumulativePL > peak) {
          peak = cumulativePL;
        } else if (peak > 0) {
          const drawdown = ((peak - cumulativePL) / peak) * 100;
          maxDrawdown = Math.max(maxDrawdown, drawdown);
        }
      }
      
      // Calculate winning and losing streaks
      let currentWinStreak = 0;
      let maxWinStreak = 0;
      let currentLoseStreak = 0;
      let maxLoseStreak = 0;
      
      for (const trade of sortedTrades) {
        if (trade.profitLoss > 0) {
          currentWinStreak++;
          currentLoseStreak = 0;
          maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
        } else if (trade.profitLoss < 0) {
          currentLoseStreak++;
          currentWinStreak = 0;
          maxLoseStreak = Math.max(maxLoseStreak, currentLoseStreak);
        }
      }
      
      const stats: Statistics = {
        totalTrades: filteredTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: Math.round((winningTrades.length / filteredTrades.length) * 100),
        totalProfitLoss: totalPL,
        averageProfitLoss: totalPL / filteredTrades.length,
        bestTrade: Math.max(...filteredTrades.map(trade => trade.profitLoss)),
        worstTrade: Math.min(...filteredTrades.map(trade => trade.profitLoss)),
        maxDrawdown: Math.round(maxDrawdown * 10) / 10, // Round to 1 decimal place
        averageDuration: Math.round(averageDurationInDays * 10) / 10, // Round to 1 decimal place
        profitFactor: winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / 
                     (Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)) || 1),
        sharpeRatio: 1.2, // This could be calculated more accurately with daily returns
        expectancy: (winningTrades.reduce((sum, t) => sum + t.profitLoss, 0) / winningTrades.length) * (winningTrades.length / filteredTrades.length) -
                   (Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0)) / losingTrades.length) * (losingTrades.length / filteredTrades.length),
        longestWinningStreak: maxWinStreak,
        longestLosingStreak: maxLoseStreak,
        totalCommission: totalCommission,
        totalSwap: totalSwap,
        netProfit: totalPL - totalCommission - totalSwap
      };
      
      setFilteredStats(stats);
      
      const symbolPerformance = filteredTrades.reduce((acc, trade) => {
        if (!acc[trade.symbol]) {
          acc[trade.symbol] = { name: trade.symbol, trades: [] };
        }
        acc[trade.symbol].trades.push(trade);
        return acc;
      }, {} as Record<string, { name: string; trades: Trade[] }>);
      
      const newFilteredSymbols = Object.values(symbolPerformance).map(item => {
        const symbolTrades = item.trades;
        const winningSymbolTrades = symbolTrades.filter(trade => trade.profitLoss > 0);
        
        return {
          name: item.name,
          tradesCount: symbolTrades.length,
          winRate: Math.round((winningSymbolTrades.length / symbolTrades.length) * 100),
          totalPL: symbolTrades.reduce((sum, trade) => sum + trade.profitLoss, 0),
          averagePips: symbolTrades.reduce((sum, trade) => sum + trade.pips, 0) / symbolTrades.length,
        };
      });
      
      setFilteredSymbols(newFilteredSymbols);
    }
  }, [dateRange, selectedTags, trades, symbols, overallStats]);

  return {
    dateRange,
    setDateRange,
    selectedTags,
    setSelectedTags,
    availableTags,
    filteredStats: filteredStats || overallStats,
    filteredSymbols: filteredSymbols.length > 0 ? filteredSymbols : symbols,
  };
};
