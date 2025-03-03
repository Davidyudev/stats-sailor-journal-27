
import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Wallet, BarChart } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { Trade, DailyPerformance } from '@/lib/types';

// Sample data for the dashboard
const generateSampleTrades = (): Trade[] => {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD'];
  const trades: Trade[] = [];
  
  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const openDate = new Date();
    openDate.setDate(openDate.getDate() - (30 - i));
    openDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const closeDate = new Date(openDate);
    closeDate.setHours(closeDate.getHours() + Math.floor(Math.random() * 8) + 1);
    
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const openPrice = parseFloat((Math.random() * 100 + 100).toFixed(5));
    const pips = parseFloat((Math.random() * 40 - 20).toFixed(1));
    const lots = parseFloat((Math.random() * 2).toFixed(2));
    
    let closePrice;
    if (type === 'buy') {
      closePrice = openPrice + pips * 0.0001;
    } else {
      closePrice = openPrice - pips * 0.0001;
    }
    
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
    });
  }
  
  return trades;
};

const generateDailyPerformance = (trades: Trade[]): DailyPerformance[] => {
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
};

const Index = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performance, setPerformance] = useState<DailyPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const sampleTrades = generateSampleTrades();
      const performanceData = generateDailyPerformance(sampleTrades);
      setTrades(sampleTrades);
      setPerformance(performanceData);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate statistics
  const totalProfitLoss = trades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = trades.filter(trade => trade.profitLoss > 0);
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
  const avgPips = trades.length > 0 
    ? trades.reduce((sum, trade) => sum + trade.pips, 0) / trades.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Wallet size={24} />}
          title="Total Profit/Loss"
          value={`$${totalProfitLoss.toFixed(2)}`}
          change={{
            value: "12.5%",
            positive: totalProfitLoss > 0
          }}
          delay={50}
        />
        <StatCard
          icon={<Activity size={24} />}
          title="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          change={{
            value: "3.2%",
            positive: true
          }}
          delay={100}
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title="Average Pips"
          value={avgPips.toFixed(1)}
          change={{
            value: "0.8",
            positive: avgPips > 0
          }}
          delay={150}
        />
        <StatCard
          icon={<BarChart size={24} />}
          title="Total Trades"
          value={trades.length}
          change={{
            value: "5",
            positive: true
          }}
          delay={200}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PerformanceChart 
          data={performance}
          className="lg:col-span-2" 
        />
        
        <div className="glass-card rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Trading Summary</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Win/Loss Ratio</span>
                <span className="font-medium">
                  {winningTrades.length} / {trades.length - winningTrades.length}
                </span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${winRate}%` }}
                ></div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Top Performing</div>
              <div className="space-y-2">
                {['EURUSD', 'GBPUSD', 'BTCUSD'].map(symbol => (
                  <div key={symbol} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <span>{symbol}</span>
                    </div>
                    <span className="text-profit text-sm">+{(Math.random() * 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Worst Performing</div>
              <div className="space-y-2">
                {['USDJPY', 'USDCAD'].map(symbol => (
                  <div key={symbol} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-loss mr-2"></div>
                      <span>{symbol}</span>
                    </div>
                    <span className="text-loss text-sm">-{(Math.random() * 50).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <RecentTrades trades={trades.slice(0, 10)} />
    </div>
  );
};

export default Index;
