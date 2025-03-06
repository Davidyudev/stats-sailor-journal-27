
import { Statistics } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TradeSummaryProps {
  stats: Statistics;
}

export const TradeSummary = ({ stats }: TradeSummaryProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Trade Summary</CardTitle>
        <CardDescription>Overall trading performance</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Total Trades</dt>
            <dd className="font-medium">{stats.totalTrades}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Winning Trades</dt>
            <dd className="font-medium text-profit">{stats.winningTrades}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Losing Trades</dt>
            <dd className="font-medium text-loss">{stats.losingTrades}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Win Rate</dt>
            <dd className="font-medium">{stats.winRate}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Total Profit/Loss</dt>
            <dd className={`font-medium ${stats.totalProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
              ${stats.totalProfitLoss.toFixed(2)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Avg. Profit/Loss</dt>
            <dd className={`font-medium ${stats.averageProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
              ${stats.averageProfitLoss.toFixed(2)}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
