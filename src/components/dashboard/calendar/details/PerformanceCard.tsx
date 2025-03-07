
import React from 'react';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

interface PerformanceCardProps {
  performance: DailyPerformance;
}

export const PerformanceCard = ({ performance }: PerformanceCardProps) => {
  // Calculate wins from performance data using winRate
  const calculateWins = (performance: DailyPerformance) => {
    return Math.round(performance.winRate * performance.trades);
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-2">Trading Performance</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Profit/Loss:</span>
            <span className={cn(
              "font-medium",
              performance.profitLoss >= 0 ? "text-profit" : "text-loss"
            )}>
              {performance.profitLoss >= 0 ? "+" : ""}{performance.profitLoss.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Trades:</span>
            <span className="font-medium">{performance.trades}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Win/Loss:</span>
            <span className="font-medium">
              {calculateWins(performance)}/{performance.trades - calculateWins(performance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Win Rate:</span>
            <span className="font-medium">
              {(performance.winRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
