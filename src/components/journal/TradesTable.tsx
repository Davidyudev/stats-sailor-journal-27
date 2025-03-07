
import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';

interface TradesTableProps {
  sortedTrades: Trade[];
  handleSort: (key: keyof Trade) => void;
  sortConfig: {
    key: keyof Trade;
    direction: 'asc' | 'desc';
  };
  handleTradeClick: (trade: Trade) => void;
  selectedTradeId?: string;
}

export const TradesTable = ({
  sortedTrades,
  handleSort,
  sortConfig,
  handleTradeClick,
  selectedTradeId
}: TradesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center gap-1">
                Symbol
                {sortConfig.key === 'symbol' && (
                  <ArrowUpDown size={14} className="text-primary" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center gap-1">
                Type
                {sortConfig.key === 'type' && (
                  <ArrowUpDown size={14} className="text-primary" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('openDate')}
            >
              <div className="flex items-center gap-1">
                Open Date
                {sortConfig.key === 'openDate' && (
                  <ArrowUpDown size={14} className="text-primary" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('closeDate')}
            >
              <div className="flex items-center gap-1">
                Close Date
                {sortConfig.key === 'closeDate' && (
                  <ArrowUpDown size={14} className="text-primary" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('profitLoss')}
            >
              <div className="flex items-center gap-1">
                P/L
                {sortConfig.key === 'profitLoss' && (
                  <ArrowUpDown size={14} className="text-primary" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('pips')}
            >
              <div className="flex items-center gap-1">
                Pips
                {sortConfig.key === 'pips' && (
                  <ArrowUpDown size={14} className="text-primary" />
                )}
              </div>
            </th>
            <th 
              className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Tags
            </th>
          </tr>
        </thead>
        <tbody className="bg-transparent divide-y divide-border">
          {sortedTrades.length > 0 ? (
            sortedTrades.map(trade => (
              <tr 
                key={trade.id} 
                onClick={() => handleTradeClick(trade)}
                className={cn(
                  "hover:bg-muted/50 transition-colors cursor-pointer",
                  selectedTradeId === trade.id ? "bg-primary/10" : ""
                )}
              >
                <td className="px-4 py-3 text-sm font-medium">{trade.symbol}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    trade.type === 'buy' ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  )}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {trade.openDate.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {trade.closeDate.toLocaleString()}
                </td>
                <td className={cn(
                  "px-4 py-3 text-sm font-medium",
                  trade.profitLoss > 0 ? "text-profit" : trade.profitLoss < 0 ? "text-loss" : ""
                )}>
                  {trade.profitLoss > 0 ? "+" : ""}{trade.profitLoss.toFixed(2)}
                </td>
                <td className={cn(
                  "px-4 py-3 text-sm font-medium",
                  trade.pips > 0 ? "text-profit" : trade.pips < 0 ? "text-loss" : ""
                )}>
                  {trade.pips > 0 ? "+" : ""}{trade.pips.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {trade.tags && trade.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {trade.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-0.5 bg-accent rounded-md text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">No tags</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No trades found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
