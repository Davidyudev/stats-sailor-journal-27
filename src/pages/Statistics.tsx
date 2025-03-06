
import { useState, useEffect } from 'react';
import { BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Symbol, Statistics as StatsType, Trade } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDataService } from '@/lib/services/mockDataService';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { TagFilter } from '@/components/ui/tag-filter';

const Statistics = () => {
  // State for filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filteredStats, setFilteredStats] = useState<StatsType | null>(null);
  const [filteredSymbols, setFilteredSymbols] = useState<Symbol[]>([]);

  // Get consistent statistics from our mock data service
  const overallStats: StatsType = mockDataService.getStatistics();
  const symbols: Symbol[] = mockDataService.getSymbols();
  const trades: Trade[] = mockDataService.getTrades();

  // Extract all available tags from trades on component mount
  useEffect(() => {
    const allTags = trades
      .filter(trade => trade.tags && trade.tags.length > 0)
      .flatMap(trade => trade.tags || []);
    const uniqueTags = Array.from(new Set(allTags));
    setAvailableTags(uniqueTags);
  }, [trades]);

  // Filter statistics based on date range and tags
  useEffect(() => {
    // If no filters are applied, use overall statistics
    if ((!dateRange || (!dateRange.from && !dateRange.to)) && selectedTags.length === 0) {
      setFilteredStats(overallStats);
      setFilteredSymbols(symbols);
      return;
    }

    // Filter trades based on date range and tags
    let filteredTrades = [...trades];

    // Apply date range filter
    if (dateRange && dateRange.from) {
      const startDate = dateRange.from;
      const endDate = dateRange.to ? new Date(dateRange.to) : new Date();
      
      // Set end date to end of day
      if (dateRange.to) {
        endDate.setHours(23, 59, 59, 999);
      }
      
      filteredTrades = filteredTrades.filter(trade => 
        trade.closeDate >= startDate && trade.closeDate <= endDate
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filteredTrades = filteredTrades.filter(trade => 
        trade.tags && trade.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Calculate statistics based on filtered trades
    if (filteredTrades.length === 0) {
      // If no trades match the filters, show empty stats
      const emptyStats: StatsType = {
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
      // Calculate new statistics based on filtered trades
      const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0);
      const losingTrades = filteredTrades.filter(trade => trade.profitLoss < 0);
      
      const totalPL = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
      const totalCommission = filteredTrades.reduce((sum, trade) => sum + (trade.commission || 0), 0);
      const totalSwap = filteredTrades.reduce((sum, trade) => sum + (trade.swap || 0), 0);
      
      const stats: StatsType = {
        totalTrades: filteredTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: Math.round((winningTrades.length / filteredTrades.length) * 100),
        totalProfitLoss: totalPL,
        averageProfitLoss: totalPL / filteredTrades.length,
        bestTrade: Math.max(...filteredTrades.map(trade => trade.profitLoss)),
        worstTrade: Math.min(...filteredTrades.map(trade => trade.profitLoss)),
        maxDrawdown: Math.round(Math.random() * 20), // This would be calculated properly in a real app
        averageDuration: Math.round(Math.random() * 5) + 1, // Simplified for this example
        profitFactor: winningTrades.reduce((sum, trade) => sum + trade.profitLoss, 0) / 
                     (Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)) || 1),
        sharpeRatio: 1.2, // Simplified for this example
        expectancy: 0.5, // Simplified for this example
        longestWinningStreak: 3, // Simplified for this example
        longestLosingStreak: 2, // Simplified for this example,
        totalCommission: totalCommission,
        totalSwap: totalSwap,
        netProfit: totalPL - totalCommission - totalSwap
      };
      
      setFilteredStats(stats);
      
      // Calculate filtered symbols
      const symbolPerformance = filteredTrades.reduce((acc, trade) => {
        if (!acc[trade.symbol]) {
          acc[trade.symbol] = {
            name: trade.symbol,
            trades: [],
          };
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

  // Display filtered stats or overall stats
  const displayStats = filteredStats || overallStats;
  const displaySymbols = filteredSymbols.length > 0 ? filteredSymbols : symbols;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trading Statistics</h1>
        <p className="text-muted-foreground">Analyze your performance metrics and identify areas for improvement.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="w-full sm:w-auto"
        />
        
        <TagFilter 
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          className="w-full sm:w-auto"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          icon={<TrendingUp size={20} />} 
          title="Overall Win Rate" 
          value={`${displayStats.winRate}%`}
          change={{ value: "2.3%", positive: true }}
          delay={100}
        />
        <StatCard 
          icon={<BarChart2 size={20} />} 
          title="Profit Factor" 
          value={displayStats.profitFactor.toFixed(2)}
          change={{ value: "0.12", positive: true }}
          delay={200}
        />
        <StatCard 
          icon={<PieChart size={20} />} 
          title="Expectancy" 
          value={displayStats.expectancy.toFixed(2)}
          change={{ value: "0.05", positive: true }}
          delay={300}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="symbols">Symbols</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Trade Summary</CardTitle>
                <CardDescription>Overall trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Total Trades</dt>
                    <dd className="font-medium">{displayStats.totalTrades}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Winning Trades</dt>
                    <dd className="font-medium text-profit">{displayStats.winningTrades}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Losing Trades</dt>
                    <dd className="font-medium text-loss">{displayStats.losingTrades}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Win Rate</dt>
                    <dd className="font-medium">{displayStats.winRate}%</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Profit/Loss</dt>
                    <dd className={`font-medium ${displayStats.totalProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${displayStats.totalProfitLoss.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg. Profit/Loss</dt>
                    <dd className={`font-medium ${displayStats.averageProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${displayStats.averageProfitLoss.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Trade Extremes</CardTitle>
                <CardDescription>Best and worst performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Best Trade</dt>
                    <dd className="font-medium text-profit">${displayStats.bestTrade.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Worst Trade</dt>
                    <dd className="font-medium text-loss">${displayStats.worstTrade.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Max Drawdown</dt>
                    <dd className="font-medium text-loss">{displayStats.maxDrawdown}%</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg. Duration</dt>
                    <dd className="font-medium">{displayStats.averageDuration} days</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Longest Win Streak</dt>
                    <dd className="font-medium text-profit">{displayStats.longestWinningStreak}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Longest Loss Streak</dt>
                    <dd className="font-medium text-loss">{displayStats.longestLosingStreak}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="symbols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Symbol Performance</CardTitle>
              <CardDescription>Performance breakdown by trading instrument</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trades</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total P/L</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Pips</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {displaySymbols.length > 0 ? (
                      displaySymbols.map((symbol, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{symbol.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{symbol.tradesCount}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{symbol.winRate}%</td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm ${symbol.totalPL >= 0 ? 'text-profit' : 'text-loss'}`}>
                            ${symbol.totalPL.toFixed(2)}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm ${symbol.averagePips >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {symbol.averagePips.toFixed(1)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No data available for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Metrics</CardTitle>
              <CardDescription>Detailed statistical analysis of trading performance</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Profit Factor</dt>
                  <dd className="font-medium text-xl">{displayStats.profitFactor.toFixed(2)}</dd>
                  <p className="text-xs text-muted-foreground mt-1">Ratio of gross profit to gross loss</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Sharpe Ratio</dt>
                  <dd className="font-medium text-xl">{displayStats.sharpeRatio.toFixed(2)}</dd>
                  <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return measure</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Expectancy</dt>
                  <dd className="font-medium text-xl">{displayStats.expectancy.toFixed(2)}</dd>
                  <p className="text-xs text-muted-foreground mt-1">Expected return per dollar risked</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Max Drawdown</dt>
                  <dd className="font-medium text-xl text-loss">{displayStats.maxDrawdown}%</dd>
                  <p className="text-xs text-muted-foreground mt-1">Maximum peak-to-trough decline</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Average Duration</dt>
                  <dd className="font-medium text-xl">{displayStats.averageDuration} days</dd>
                  <p className="text-xs text-muted-foreground mt-1">Average time in market</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Win/Loss Ratio</dt>
                  <dd className="font-medium text-xl">
                    {displayStats.losingTrades === 0 
                      ? "∞" 
                      : (displayStats.winningTrades / displayStats.losingTrades).toFixed(2)}
                  </dd>
                  <p className="text-xs text-muted-foreground mt-1">Ratio of winning to losing trades</p>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
