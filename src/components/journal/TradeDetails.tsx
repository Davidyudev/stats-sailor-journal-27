
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MountTransition } from '@/components/ui/mt4-connector';

interface TradeDetailsProps {
  trade: Trade | null;
}

export const TradeDetails = ({ trade }: TradeDetailsProps) => {
  if (!trade) {
    return (
      <MountTransition className="glass-card rounded-lg w-full lg:w-96 p-4 flex items-center justify-center h-64">
        <div className="text-center text-muted-foreground">
          <p>Select a trade to view details</p>
        </div>
      </MountTransition>
    );
  }

  return (
    <MountTransition 
      className="glass-card rounded-lg w-full lg:w-96 p-4 space-y-4 overflow-auto max-h-[calc(100vh-12rem)]"
      key={trade.id}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{trade.symbol} {trade.type.toUpperCase()}</h3>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="text-sm font-medium capitalize">{trade.status}</span>
        </div>
      </div>
      
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
      
      {trade.tags && trade.tags.length > 0 && (
        <div className="border-t pt-4">
          <span className="text-muted-foreground text-sm">Tags</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {trade.tags.map(tag => (
              <div key={tag} className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-xs">
                {tag}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {trade.notes && (
        <div className="border-t pt-4">
          <span className="text-muted-foreground text-sm">Notes</span>
          <p className="mt-2 text-sm bg-muted/50 p-3 rounded-md">
            {trade.notes}
          </p>
        </div>
      )}
      
      <div className="border-t pt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1">Edit</Button>
        <Button variant="outline" size="sm" className="flex-1">Delete</Button>
      </div>
    </MountTransition>
  );
};
