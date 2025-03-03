
import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';

interface RecentTradesProps {
  trades: Trade[];
  className?: string;
}

export const RecentTrades = ({ trades, className }: RecentTradesProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade;
    direction: 'asc' | 'desc';
  }>({
    key: 'closeDate',
    direction: 'desc',
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (key: keyof Trade) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredTrades = trades.filter(trade => 
    trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortConfig.key === 'openDate' || sortConfig.key === 'closeDate') {
      const aValue = a[sortConfig.key] as Date;
      const bValue = b[sortConfig.key] as Date;
      
      return sortConfig.direction === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
      const aValue = a[sortConfig.key] as number;
      const bValue = b[sortConfig.key] as number;
      
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }
    
    const aValue = String(a[sortConfig.key]);
    const bValue = String(b[sortConfig.key]);
    
    return sortConfig.direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const SortHeader = ({ title, property }: { title: string; property: keyof Trade }) => (
    <th 
      className={cn(
        "px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer",
        sortConfig.key === property ? "text-primary" : ""
      )}
      onClick={() => handleSort(property)}
    >
      <div className="flex items-center gap-1">
        {title}
        {sortConfig.key === property ? (
          sortConfig.direction === 'asc' ? (
            <ChevronUp size={14} className="text-primary" />
          ) : (
            <ChevronDown size={14} className="text-primary" />
          )
        ) : null}
      </div>
    </th>
  );

  return (
    <MountTransition delay={200} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 className="text-lg font-medium">Recent Trades</h3>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-2 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <SortHeader title="Symbol" property="symbol" />
                <SortHeader title="Type" property="type" />
                <SortHeader title="Open Date" property="openDate" />
                <SortHeader title="Close Date" property="closeDate" />
                <SortHeader title="Profit/Loss" property="profitLoss" />
                <SortHeader title="Pips" property="pips" />
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-border">
              {sortedTrades.length > 0 ? (
                sortedTrades.map(trade => (
                  <tr key={trade.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No trades found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MountTransition>
  );
};
