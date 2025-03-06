
import { Statistics } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TradeExtremesProps {
  stats: Statistics;
}

export const TradeExtremes = ({ stats }: TradeExtremesProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Trade Extremes</CardTitle>
        <CardDescription>Best and worst performance metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Best Trade</dt>
            <dd className="font-medium text-profit">${stats.bestTrade.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Worst Trade</dt>
            <dd className="font-medium text-loss">${stats.worstTrade.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Max Drawdown</dt>
            <dd className="font-medium text-loss">{stats.maxDrawdown}%</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Avg. Duration</dt>
            <dd className="font-medium">{stats.averageDuration} days</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Longest Win Streak</dt>
            <dd className="font-medium text-profit">{stats.longestWinningStreak}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Longest Loss Streak</dt>
            <dd className="font-medium text-loss">{stats.longestLosingStreak}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
