
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';

interface BasicInfoProps {
  trade: Trade;
}

export const BasicInfo = ({ trade }: BasicInfoProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{trade.symbol} {trade.type.toUpperCase()}</h3>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Status</span>
        <span className="text-sm font-medium capitalize">{trade.status}</span>
      </div>
    </div>
  );
};
