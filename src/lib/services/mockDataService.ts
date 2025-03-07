
import { Trade, DailyPerformance, Statistics, Symbol } from '@/lib/types';

// Generate consistent mock data
class MockDataService {
  private static instance: MockDataService;
  private trades: Trade[] = [];
  private symbols: Symbol[] = [];
  private stats: Statistics | null = null;
  private dailyPerformance: DailyPerformance[] = [];
  
  private constructor() {
    this.generateData();
  }
  
  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }
  
  private generateData(): void {
    // Generate trades with fixed seed for consistency
    this.trades = this.generateSampleTrades();
    this.dailyPerformance = this.generateDailyPerformance(this.trades);
    this.symbols = this.generateSymbolPerformance(this.trades);
    this.stats = this.calculateStatistics(this.trades, this.symbols);
  }
  
  private generateSampleTrades(): Trade[] {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'XAUUSD'];
    const trades: Trade[] = [];
    
    // Use fixed seed values for consistent results
    const seedValues = [
      { type: 'buy', pipsMod: 25, lotsMod: 1.5 },
      { type: 'sell', pipsMod: -15, lotsMod: 0.8 },
      { type: 'buy', pipsMod: 12, lotsMod: 1.2 },
      { type: 'sell', pipsMod: -8, lotsMod: 0.5 },
      { type: 'buy', pipsMod: 30, lotsMod: 2.0 }
    ];
    
    // Generate data for the last 60 days instead of 30 to include January trades
    for (let i = 0; i < 60; i++) {
      const openDate = new Date();
      openDate.setDate(openDate.getDate() - (60 - i));
      // Use predictable hour/minute based on index
      openDate.setHours(9 + (i % 8), (i * 7) % 60);
      
      const closeDate = new Date(openDate);
      closeDate.setHours(closeDate.getHours() + 2 + (i % 4));
      
      const seedIndex = i % seedValues.length;
      const type = seedValues[seedIndex].type as 'buy' | 'sell';
      const symbol = symbols[i % symbols.length];
      
      const openPrice = 100 + (i % 100);
      const pips = seedValues[seedIndex].pipsMod + (i % 5);
      // Fix: Convert lots to number explicitly
      const lots = parseFloat(((i % 10) / 10 + seedValues[seedIndex].lotsMod).toFixed(2));
      
      let closePrice;
      if (type === 'buy') {
        closePrice = openPrice + pips * 0.0001;
      } else {
        closePrice = openPrice - pips * 0.0001;
      }
      
      const commission = parseFloat((lots * 0.7).toFixed(2));
      const swap = parseFloat(((i % 3) * 0.5).toFixed(2));
      const profitLoss = parseFloat((pips * 10 * lots).toFixed(2));
      
      trades.push({
        id: `trade-${i}`,
        symbol,
        type,
        openDate,
        closeDate,
        openPrice,
        closePrice,
        profitLoss,
        pips,
        lots,
        status: 'closed',
        commission,
        swap
      });
    }
    
    return trades;
  }
  
  private generateDailyPerformance(trades: Trade[]): DailyPerformance[] {
    const dailyPerformance: Record<string, DailyPerformance> = {};
    
    trades.forEach(trade => {
      const date = trade.closeDate.toISOString().split('T')[0];
      
      if (!dailyPerformance[date]) {
        dailyPerformance[date] = {
          date: new Date(date),
          profitLoss: 0,
          trades: 0,
          winRate: 0,
        };
      }
      
      dailyPerformance[date].profitLoss += trade.profitLoss;
      dailyPerformance[date].trades += 1;
      
      const wins = trades
        .filter(t => t.closeDate.toISOString().split('T')[0] === date && t.profitLoss > 0)
        .length;
        
      dailyPerformance[date].winRate = wins / dailyPerformance[date].trades;
    });
    
    return Object.values(dailyPerformance).sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  private generateSymbolPerformance(trades: Trade[]): Symbol[] {
    const symbolMap: Record<string, Symbol> = {};
    
    trades.forEach(trade => {
      if (!symbolMap[trade.symbol]) {
        symbolMap[trade.symbol] = {
          name: trade.symbol,
          tradesCount: 0,
          winRate: 0,
          totalPL: 0,
          averagePips: 0
        };
      }
      
      symbolMap[trade.symbol].tradesCount += 1;
      symbolMap[trade.symbol].totalPL += trade.profitLoss;
    });
    
    // Calculate win rate and average pips for each symbol
    Object.keys(symbolMap).forEach(symbol => {
      const symbolTrades = trades.filter(t => t.symbol === symbol);
      const winningTrades = symbolTrades.filter(t => t.profitLoss > 0);
      
      symbolMap[symbol].winRate = parseFloat(((winningTrades.length / symbolTrades.length) * 100).toFixed(1));
      symbolMap[symbol].averagePips = parseFloat((symbolTrades.reduce((sum, t) => sum + t.pips, 0) / symbolTrades.length).toFixed(1));
    });
    
    return Object.values(symbolMap);
  }
  
  private calculateStatistics(trades: Trade[], symbols: Symbol[]): Statistics {
    const winningTrades = trades.filter(trade => trade.profitLoss > 0);
    const losingTrades = trades.filter(trade => trade.profitLoss < 0);
    
    const totalProfitLoss = parseFloat(trades.reduce((sum, trade) => sum + trade.profitLoss, 0).toFixed(2));
    const totalCommission = parseFloat(trades.reduce((sum, trade) => sum + (trade.commission || 0), 0).toFixed(2));
    const totalSwap = parseFloat(trades.reduce((sum, trade) => sum + (trade.swap || 0), 0).toFixed(2));
    
    // Calculate best and worst trades
    const bestTrade = Math.max(...trades.map(t => t.profitLoss));
    const worstTrade = Math.min(...trades.map(t => t.profitLoss));
    
    // Calculate longest winning and losing streaks
    let currentWinStreak = 0;
    let longestWinStreak = 0;
    let currentLoseStreak = 0;
    let longestLoseStreak = 0;
    
    // Sort trades by date for streak calculation
    const sortedTrades = [...trades].sort((a, b) => a.closeDate.getTime() - b.closeDate.getTime());
    
    sortedTrades.forEach(trade => {
      if (trade.profitLoss > 0) {
        currentWinStreak++;
        currentLoseStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else if (trade.profitLoss < 0) {
        currentLoseStreak++;
        currentWinStreak = 0;
        longestLoseStreak = Math.max(longestLoseStreak, currentLoseStreak);
      }
    });
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: parseFloat(((winningTrades.length / trades.length) * 100).toFixed(1)),
      totalProfitLoss,
      averageProfitLoss: parseFloat((totalProfitLoss / trades.length).toFixed(2)),
      bestTrade,
      worstTrade,
      profitFactor: parseFloat((winningTrades.reduce((sum, t) => sum + t.profitLoss, 0) / Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0))).toFixed(2)),
      sharpeRatio: 1.87, // Mock value for simplicity
      expectancy: 0.67, // Mock value for simplicity
      averageDuration: 3.5, // Mock value for simplicity
      maxDrawdown: 8.7, // Mock value for simplicity
      longestWinningStreak: longestWinStreak,
      longestLosingStreak: longestLoseStreak,
      totalCommission,
      totalSwap,
      netProfit: parseFloat((totalProfitLoss - totalCommission - totalSwap).toFixed(2))
    };
  }
  
  // Public methods to access the data
  public getTrades(): Trade[] {
    return [...this.trades];
  }
  
  public getRecentTrades(count: number): Trade[] {
    return [...this.trades]
      .sort((a, b) => b.closeDate.getTime() - a.closeDate.getTime())
      .slice(0, count);
  }
  
  public getDailyPerformance(): DailyPerformance[] {
    return [...this.dailyPerformance];
  }
  
  public getSymbols(): Symbol[] {
    return [...this.symbols];
  }
  
  public getStatistics(): Statistics {
    return this.stats!;
  }
}

export const mockDataService = MockDataService.getInstance();
