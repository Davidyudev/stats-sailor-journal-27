
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';

interface ProfitLossInfoProps {
  trade: Trade;
}

export const ProfitLossInfo = ({ trade }: ProfitLossInfoProps) => {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Profit/Loss</span>
        <span className={cn(
          "text-sm font-medium",
          trade.profitLoss > 0 ? "text-profit" : "text-loss"
        )}>
          {trade.profitLoss > 0 ? "+" : ""}{trade.profitLoss.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Pips</span>
        <span className={cn(
          "text-sm font-medium",
          trade.pips > 0 ? "text-profit" : "text-loss"
        )}>
          {trade.pips > 0 ? "+" : ""}{trade.pips.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
