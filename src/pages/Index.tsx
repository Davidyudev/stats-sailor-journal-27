
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
import { ChartDetailModal } from '@/components/dashboard/ChartDetailModal';
import { TimePeriod } from '@/components/filters/DateRangeFilter';

const Index = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performance, setPerformance] = useState<DailyPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Modal states
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const [durationModalOpen, setDurationModalOpen] = useState(false);
  
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
    setTimeout(() => {
      setTrades(mockDataService.getTrades());
      setPerformance(mockDataService.getDailyPerformance());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter trades based on selected time period
  const filteredTrades = (() => {
    let result = [...trades];
    
    if (selectedTimePeriod === 'custom' && startDate && endDate) {
      result = result.filter(trade => 
        trade.closeDate >= startDate && trade.closeDate <= endDate
      );
    } else if (selectedTimePeriod !== 'all') {
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
      
      result = result.filter(trade => trade.closeDate >= cutoffDate);
    }
    
    return result;
  })();

  // Calculate statistics based on filtered trades
  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0);
  const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
  const avgPips = filteredTrades.length > 0 
    ? filteredTrades.reduce((sum, trade) => sum + trade.pips, 0) / filteredTrades.length 
    : 0;

  // Filter symbols based on time period
  const filteredSymbols = (() => {
    if (selectedTimePeriod === 'all' && !startDate && !endDate) return mockDataService.getSymbols();
    
    // Create a map of symbols with reset performance data
    const symbolMap = new Map();
    mockDataService.getSymbols().forEach(symbol => {
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
    let result = [...performance];
    
    if (selectedTimePeriod === 'custom' && startDate && endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (selectedTimePeriod !== 'all') {
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
      
      result = result.filter(item => new Date(item.date) >= cutoffDate);
    }
    
    return result;
  })();

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
          value={filteredTrades.length}
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
              selectedPeriod={selectedTimePeriod}
              setSelectedPeriod={setSelectedTimePeriod}
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            
            <div className="glass-card rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Trading Summary</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win/Loss Ratio</span>
                    <span className="font-medium">
                      {winningTrades.length} / {filteredTrades.length - winningTrades.length}
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
                    {filteredSymbols
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
                    {filteredSymbols
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
            <AssetPerformanceChart 
              data={filteredSymbols}
              onMaximize={() => setAssetModalOpen(true)} 
            />
            <MonthlyPerformanceChart 
              data={filteredPerformance}
              onMaximize={() => setMonthlyModalOpen(true)} 
            />
            <DurationPerformanceChart 
              trades={filteredTrades}
              onMaximize={() => setDurationModalOpen(true)} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          <PerformanceCalendar 
            data={filteredPerformance}
            holidays={holidays}
          />
        </TabsContent>
      </Tabs>
      
      <RecentTrades trades={filteredTrades.slice(0, 10)} />
      
      {/* Detailed Chart Modals */}
      <ChartDetailModal
        open={assetModalOpen}
        onOpenChange={setAssetModalOpen}
        title="Asset Performance"
      >
        <AssetPerformanceChart 
          data={filteredSymbols}
          isDetailed={true}
        />
      </ChartDetailModal>
      
      <ChartDetailModal
        open={monthlyModalOpen}
        onOpenChange={setMonthlyModalOpen}
        title="Monthly Performance"
      >
        <MonthlyPerformanceChart 
          data={filteredPerformance}
          isDetailed={true}
        />
      </ChartDetailModal>
      
      <ChartDetailModal
        open={durationModalOpen}
        onOpenChange={setDurationModalOpen}
        title="Trade Duration vs P/L"
      >
        <DurationPerformanceChart 
          trades={filteredTrades}
          isDetailed={true}
        />
      </ChartDetailModal>
    </div>
  );
};

export default Index;
