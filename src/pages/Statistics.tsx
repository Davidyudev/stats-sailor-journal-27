import { BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Symbol, Statistics as StatsType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDataService } from '@/lib/services/mockDataService';

const Statistics = () => {
  // Get consistent statistics from our mock data service
  const overallStats: StatsType = mockDataService.getStatistics();
  const symbols: Symbol[] = mockDataService.getSymbols();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Trading Statistics</h1>
        <p className="text-muted-foreground">Analyze your performance metrics and identify areas for improvement.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          icon={<TrendingUp size={20} />} 
          title="Overall Win Rate" 
          value={`${overallStats.winRate}%`}
          change={{ value: "2.3%", positive: true }}
          delay={100}
        />
        <StatCard 
          icon={<BarChart2 size={20} />} 
          title="Profit Factor" 
          value={overallStats.profitFactor.toFixed(2)}
          change={{ value: "0.12", positive: true }}
          delay={200}
        />
        <StatCard 
          icon={<PieChart size={20} />} 
          title="Expectancy" 
          value={overallStats.expectancy.toFixed(2)}
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
                    <dd className="font-medium">{overallStats.totalTrades}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Winning Trades</dt>
                    <dd className="font-medium text-profit">{overallStats.winningTrades}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Losing Trades</dt>
                    <dd className="font-medium text-loss">{overallStats.losingTrades}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Win Rate</dt>
                    <dd className="font-medium">{overallStats.winRate}%</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total Profit/Loss</dt>
                    <dd className={`font-medium ${overallStats.totalProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${overallStats.totalProfitLoss.toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg. Profit/Loss</dt>
                    <dd className={`font-medium ${overallStats.averageProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${overallStats.averageProfitLoss.toFixed(2)}
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
                    <dd className="font-medium text-profit">${overallStats.bestTrade.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Worst Trade</dt>
                    <dd className="font-medium text-loss">${overallStats.worstTrade.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Max Drawdown</dt>
                    <dd className="font-medium text-loss">{overallStats.maxDrawdown}%</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Avg. Duration</dt>
                    <dd className="font-medium">{overallStats.averageDuration} days</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Longest Win Streak</dt>
                    <dd className="font-medium text-profit">{overallStats.longestWinningStreak}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Longest Loss Streak</dt>
                    <dd className="font-medium text-loss">{overallStats.longestLosingStreak}</dd>
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
                    {symbols.map((symbol, index) => (
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
                    ))}
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
                  <dd className="font-medium text-xl">{overallStats.profitFactor.toFixed(2)}</dd>
                  <p className="text-xs text-muted-foreground mt-1">Ratio of gross profit to gross loss</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Sharpe Ratio</dt>
                  <dd className="font-medium text-xl">{overallStats.sharpeRatio.toFixed(2)}</dd>
                  <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return measure</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Expectancy</dt>
                  <dd className="font-medium text-xl">{overallStats.expectancy.toFixed(2)}</dd>
                  <p className="text-xs text-muted-foreground mt-1">Expected return per dollar risked</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Max Drawdown</dt>
                  <dd className="font-medium text-xl text-loss">{overallStats.maxDrawdown}%</dd>
                  <p className="text-xs text-muted-foreground mt-1">Maximum peak-to-trough decline</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Average Duration</dt>
                  <dd className="font-medium text-xl">{overallStats.averageDuration} days</dd>
                  <p className="text-xs text-muted-foreground mt-1">Average time in market</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <dt className="text-muted-foreground mb-1">Win/Loss Ratio</dt>
                  <dd className="font-medium text-xl">{(overallStats.winningTrades / overallStats.losingTrades).toFixed(2)}</dd>
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
