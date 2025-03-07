
import { useState, useEffect } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { Trade } from '@/lib/types';
import { mockDataService } from '@/lib/services/mockDataService';
import { JournalHeader } from '@/components/journal/JournalHeader';
import { TradesTable } from '@/components/journal/TradesTable';
import { TradeDetails } from '@/components/journal/TradeDetails';
import { useTradeFilters } from '@/components/journal/useTradeFilters';
import { useTradeSorting } from '@/components/journal/useTradeSorting';

const Journal = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => {
      const allTrades = mockDataService.getTrades();
      setTrades(allTrades);
      setIsLoading(false);
    }, 1000);
  }, []);

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    availableSymbols,
    availableTags,
    filteredTrades,
    handleDateRangeChange,
    handleTagsChange,
    toggleSymbolFilter,
    toggleAllSymbols,
    toggleTradeTypeFilter
  } = useTradeFilters(trades);

  const {
    sortConfig,
    handleSort,
    sortedTrades
  } = useTradeSorting(filteredTrades);

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  return (
    <div className="space-y-6">
      <JournalHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        availableSymbols={availableSymbols}
        availableTags={availableTags}
        handleDateRangeChange={handleDateRangeChange}
        handleTagsChange={handleTagsChange}
        toggleSymbolFilter={toggleSymbolFilter}
        toggleAllSymbols={toggleAllSymbols}
        toggleTradeTypeFilter={toggleTradeTypeFilter}
      />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <MountTransition className="glass-card rounded-lg flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading trades...</p>
            </div>
          ) : (
            <TradesTable 
              sortedTrades={sortedTrades}
              handleSort={handleSort}
              sortConfig={sortConfig}
              handleTradeClick={handleTradeClick}
              selectedTradeId={selectedTrade?.id}
            />
          )}
        </MountTransition>
        
        <TradeDetails trade={selectedTrade} />
      </div>
    </div>
  );
};

export default Journal;
