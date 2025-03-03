
import { useState, useEffect } from 'react';
import { Search, Filter, Download, ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MountTransition } from '@/components/ui/mt4-connector';
import { Trade } from '@/lib/types';
import { cn } from '@/lib/utils';

// Generate sample data (same as in Dashboard)
const generateSampleTrades = (): Trade[] => {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'BTCUSD'];
  const trades: Trade[] = [];
  
  for (let i = 0; i < 50; i++) {
    const openDate = new Date();
    openDate.setDate(openDate.getDate() - (50 - i));
    openDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const closeDate = new Date(openDate);
    closeDate.setHours(closeDate.getHours() + Math.floor(Math.random() * 8) + 1);
    
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const openPrice = parseFloat((Math.random() * 100 + 100).toFixed(5));
    const pips = parseFloat((Math.random() * 40 - 20).toFixed(1));
    const lots = parseFloat((Math.random() * 2).toFixed(2));
    
    let closePrice;
    if (type === 'buy') {
      closePrice = openPrice + pips * 0.0001;
    } else {
      closePrice = openPrice - pips * 0.0001;
    }
    
    const profitLoss = parseFloat((pips * 10 * lots).toFixed(2));
    
    // Sometimes add notes and tags
    const notes = Math.random() > 0.7 ? 'Trade taken based on support/resistance level' : 
                Math.random() > 0.5 ? 'Following the trend after breakout' : undefined;
    
    const tags = [];
    if (Math.random() > 0.6) tags.push('Trend');
    if (Math.random() > 0.7) tags.push('Breakout');
    if (Math.random() > 0.8) tags.push('News');
    
    trades.push({
      id: `trade-${i}`,
      symbol,
      type,
      openDate,
      closeDate,
      openPrice,
      closePrice,
      profitLoss,
      pips,
      lots,
      status: 'closed',
      notes,
      tags: tags.length ? tags : undefined,
      takeProfit: Math.random() > 0.5 ? openPrice + (type === 'buy' ? 0.0030 : -0.0030) : undefined,
      stopLoss: Math.random() > 0.5 ? openPrice + (type === 'buy' ? -0.0020 : 0.0020) : undefined,
    });
  }
  
  return trades;
};

const Journal = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade;
    direction: 'asc' | 'desc';
  }>({
    key: 'closeDate',
    direction: 'desc',
  });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const sampleTrades = generateSampleTrades();
      setTrades(sampleTrades);
      setFilteredTrades(sampleTrades);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Filter trades based on search query
    if (searchQuery) {
      const filtered = trades.filter(trade => 
        trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trade.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trade.tags && trade.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      setFilteredTrades(filtered);
    } else {
      setFilteredTrades(trades);
    }
  }, [searchQuery, trades]);

  const handleSort = (key: keyof Trade) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

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

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Trading Journal</h1>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-2 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full sm:w-64"
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-9">
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          
          <Button variant="outline" size="sm" className="h-9">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          
          <Button size="sm" className="h-9">
            <Plus size={16} className="mr-2" />
            New Trade
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <MountTransition className="glass-card rounded-lg flex-1 overflow-hidden">
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
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-border">
                {sortedTrades.map(trade => (
                  <tr 
                    key={trade.id} 
                    onClick={() => handleTradeClick(trade)}
                    className={cn(
                      "hover:bg-muted/50 transition-colors cursor-pointer",
                      selectedTrade?.id === trade.id ? "bg-primary/10" : ""
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MountTransition>
        
        {selectedTrade ? (
          <MountTransition 
            className="glass-card rounded-lg w-full lg:w-96 p-4 space-y-4 overflow-auto max-h-[calc(100vh-12rem)]"
            key={selectedTrade.id}
          >
            <div className="space-y-2">
              <h3 className="text-lg font-medium">{selectedTrade.symbol} {selectedTrade.type.toUpperCase()}</h3>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-sm font-medium capitalize">{selectedTrade.status}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open</span>
                <span className="text-sm">{selectedTrade.openDate.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Close</span>
                <span className="text-sm">{selectedTrade.closeDate.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-sm">
                  {Math.round((selectedTrade.closeDate.getTime() - selectedTrade.openDate.getTime()) / (1000 * 60 * 60))}h 
                  {' '}
                  {Math.round(((selectedTrade.closeDate.getTime() - selectedTrade.openDate.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
                </span>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open Price</span>
                <span className="text-sm font-mono">{selectedTrade.openPrice.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Close Price</span>
                <span className="text-sm font-mono">{selectedTrade.closePrice.toFixed(5)}</span>
              </div>
              {selectedTrade.takeProfit && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Take Profit</span>
                  <span className="text-sm font-mono">{selectedTrade.takeProfit.toFixed(5)}</span>
                </div>
              )}
              {selectedTrade.stopLoss && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stop Loss</span>
                  <span className="text-sm font-mono">{selectedTrade.stopLoss.toFixed(5)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lots</span>
                <span className="text-sm font-mono">{selectedTrade.lots.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Profit/Loss</span>
                <span className={cn(
                  "text-sm font-medium",
                  selectedTrade.profitLoss > 0 ? "text-profit" : "text-loss"
                )}>
                  {selectedTrade.profitLoss > 0 ? "+" : ""}{selectedTrade.profitLoss.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pips</span>
                <span className={cn(
                  "text-sm font-medium",
                  selectedTrade.pips > 0 ? "text-profit" : "text-loss"
                )}>
                  {selectedTrade.pips > 0 ? "+" : ""}{selectedTrade.pips.toFixed(1)}
                </span>
              </div>
            </div>
            
            {selectedTrade.tags && selectedTrade.tags.length > 0 && (
              <div className="border-t pt-4">
                <span className="text-muted-foreground text-sm">Tags</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTrade.tags.map(tag => (
                    <div key={tag} className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-xs">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedTrade.notes && (
              <div className="border-t pt-4">
                <span className="text-muted-foreground text-sm">Notes</span>
                <p className="mt-2 text-sm bg-muted/50 p-3 rounded-md">
                  {selectedTrade.notes}
                </p>
              </div>
            )}
            
            <div className="border-t pt-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">Edit</Button>
              <Button variant="outline" size="sm" className="flex-1">Delete</Button>
            </div>
          </MountTransition>
        ) : (
          <MountTransition className="glass-card rounded-lg w-full lg:w-96 p-4 flex items-center justify-center h-64">
            <div className="text-center text-muted-foreground">
              <p>Select a trade to view details</p>
            </div>
          </MountTransition>
        )}
      </div>
    </div>
  );
};

export default Journal;
