
import { Trade } from '@/lib/types';

interface DateInfoProps {
  trade: Trade;
}

export const DateInfo = ({ trade }: DateInfoProps) => {
  return (
    <div className="border-t pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Open</span>
        <span className="text-sm">{trade.openDate.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Close</span>
        <span className="text-sm">{trade.closeDate.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Duration</span>
        <span className="text-sm">
          {Math.round((trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60))}h 
          {' '}
          {Math.round(((trade.closeDate.getTime() - trade.openDate.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
        </span>
      </div>
    </div>
  );
};
