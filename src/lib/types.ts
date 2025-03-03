
export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  openDate: Date;
  closeDate: Date;
  openPrice: number;
  closePrice: number;
  profitLoss: number;
  pips: number;
  lots: number;
  status: 'open' | 'closed';
  takeProfit?: number;
  stopLoss?: number;
  notes?: string;
  tags?: string[];
}

export interface DailyPerformance {
  date: Date;
  profitLoss: number;
  trades: number;
  winRate: number;
}

export interface Symbol {
  name: string;
  tradesCount: number;
  winRate: number;
  totalPL: number;
  averagePips: number;
}

export interface Statistics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageProfitLoss: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
  sharpeRatio: number;
  expectancy: number;
  averageDuration: number;
  // Advanced metrics
  maxDrawdown: number;
  longestWinningStreak: number;
  longestLosingStreak: number;
}

export interface MT4Config {
  enabled: boolean;
  serverAddress: string;
  accountNumber: string;
  password: string;
  lastSync: Date | null;
  autoSync: boolean;
  syncInterval: number; // in minutes
}
