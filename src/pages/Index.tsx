
import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Wallet, BarChart } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AssetPerformanceChart } from '@/components/dashboard/AssetPerformanceChart';
import { MonthlyPerformanceChart } from '@/components/dashboard/MonthlyPerformanceChart';
import { DurationPerformanceChart } from '@/components/dashboard/DurationPerformanceChart';
import { PerformanceCalendar } from '@/components/dashboard/PerformanceCalendar';
import { Trade, DailyPerformance } from '@/lib/types';
import { mockDataService } from '@/lib/services/mockDataService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performance, setPerformance] = useState<DailyPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock economic events for the calendar
  const economicEvents = [
    {
      date: new Date(2023, 10, 1), // November 1, 2023
      name: 'Fed Interest Rate Decision',
      impact: 'high' as const
    },
    {
      date: new Date(2023, 10, 3), // November 3, 2023
      name: 'Non-Farm Payrolls',
      impact: 'high' as const
    },
    {
      date: new Date(2023, 10, 10), // November 10, 2023
      name: 'CPI Data Release',
      impact: 'high' as const
    }
  ];
  
  // Mock bank holidays for the calendar
  const holidays = [
    {
      date: new Date(2023, 10, 23), // November 23, 2023
      name: 'Thanksgiving Day'
    },
    {
      date: new Date(2023, 10, 24), // November 24, 2023
      name: 'Black Friday'
    }
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setTrades(mockDataService.getTrades());
      setPerformance(mockDataService.getDailyPerformance());
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

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
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
                    {mockDataService.getSymbols()
                      .filter(symbol => symbol.totalPL > 0)
                      .sort((a, b) => b.totalPL - a.totalPL)
                      .slice(0, 3)
                      .map(symbol => (
                        <div key={symbol.name} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                            <span>{symbol.name}</span>
                          </div>
                          <span className="text-profit text-sm">+{symbol.totalPL.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Worst Performing</div>
                  <div className="space-y-2">
                    {mockDataService.getSymbols()
                      .filter(symbol => symbol.totalPL < 0)
                      .sort((a, b) => a.totalPL - b.totalPL)
                      .slice(0, 3)
                      .map(symbol => (
                        <div key={symbol.name} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-loss mr-2"></div>
                            <span>{symbol.name}</span>
                          </div>
                          <span className="text-loss text-sm">{symbol.totalPL.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AssetPerformanceChart data={mockDataService.getSymbols()} />
            <MonthlyPerformanceChart data={performance} />
            <DurationPerformanceChart trades={trades} />
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <PerformanceCalendar 
            data={performance} 
            economicEvents={economicEvents}
            holidays={holidays}
          />
        </TabsContent>
      </Tabs>
      
      <RecentTrades trades={mockDataService.getRecentTrades(10)} />
    </div>
  );
};

export default Index;
