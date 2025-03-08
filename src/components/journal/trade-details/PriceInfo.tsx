
import { Trade } from '@/lib/types';

interface PriceInfoProps {
  trade: Trade;
}

export const PriceInfo = ({ trade }: PriceInfoProps) => {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Open Price</span>
        <span className="text-sm font-mono">{trade.openPrice.toFixed(5)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Close Price</span>
        <span className="text-sm font-mono">{trade.closePrice.toFixed(5)}</span>
      </div>
      {trade.takeProfit && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Take Profit</span>
          <span className="text-sm font-mono">{trade.takeProfit.toFixed(5)}</span>
        </div>
      )}
      {trade.stopLoss && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Stop Loss</span>
          <span className="text-sm font-mono">{trade.stopLoss.toFixed(5)}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Lots</span>
        <span className="text-sm font-mono">{trade.lots.toFixed(2)}</span>
      </div>
    </div>
  );
};
