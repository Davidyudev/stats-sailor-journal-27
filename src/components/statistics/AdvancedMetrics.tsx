
import { Statistics } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdvancedMetricsProps {
  stats: Statistics;
}

export const AdvancedMetrics = ({ stats }: AdvancedMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Metrics</CardTitle>
        <CardDescription>Detailed statistical analysis of trading performance</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/30 p-4 rounded-lg">
            <dt className="text-muted-foreground mb-1">Profit Factor</dt>
            <dd className="font-medium text-xl">{stats.profitFactor.toFixed(2)}</dd>
            <p className="text-xs text-muted-foreground mt-1">Ratio of gross profit to gross loss</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <dt className="text-muted-foreground mb-1">Sharpe Ratio</dt>
            <dd className="font-medium text-xl">{stats.sharpeRatio.toFixed(2)}</dd>
            <p className="text-xs text-muted-foreground mt-1">Risk-adjusted return measure</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <dt className="text-muted-foreground mb-1">Expectancy</dt>
            <dd className="font-medium text-xl">{stats.expectancy.toFixed(2)}</dd>
            <p className="text-xs text-muted-foreground mt-1">Expected return per dollar risked</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <dt className="text-muted-foreground mb-1">Max Drawdown</dt>
            <dd className="font-medium text-xl text-loss">{stats.maxDrawdown}%</dd>
            <p className="text-xs text-muted-foreground mt-1">Maximum peak-to-trough decline</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <dt className="text-muted-foreground mb-1">Average Duration</dt>
            <dd className="font-medium text-xl">{stats.averageDuration} days</dd>
            <p className="text-xs text-muted-foreground mt-1">Average time in market</p>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <dt className="text-muted-foreground mb-1">Win/Loss Ratio</dt>
            <dd className="font-medium text-xl">
              {stats.losingTrades === 0 
                ? "∞" 
                : (stats.winningTrades / stats.losingTrades).toFixed(2)}
            </dd>
            <p className="text-xs text-muted-foreground mt-1">Ratio of winning to losing trades</p>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
