
import { useState, useEffect, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { Trade } from '@/lib/types';
import { FilterOptions } from './types';

export const useTradeFilters = (trades: Trade[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    timePeriod: 'all',
    symbols: [],
    tradeType: ['buy', 'sell'],
    profitOnly: false,
    lossOnly: false,
    withNotes: false,
    tags: []
  });

  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Extract available symbols and tags from trades
  useEffect(() => {
    if (trades.length > 0) {
      const symbols = Array.from(new Set(trades.map(trade => trade.symbol)));
      setAvailableSymbols(symbols);
      setFilters(prev => ({ ...prev, symbols }));
      
      const allTags = trades
        .filter(trade => trade.tags && trade.tags.length > 0)
        .flatMap(trade => trade.tags || []);
      const uniqueTags = Array.from(new Set(allTags));
      setAvailableTags(uniqueTags);
    }
  }, [trades]);

  // Filter trades based on current filters and search query
  const filteredTrades = useMemo(() => {
    let result = [...trades];

    // Apply symbol filter
    if (filters.symbols.length > 0 && filters.symbols.length !== availableSymbols.length) {
      result = result.filter(trade => filters.symbols.includes(trade.symbol));
    }

    // Apply trade type filter
    if (filters.tradeType.length > 0 && !filters.tradeType.includes('all')) {
      result = result.filter(trade => filters.tradeType.includes(trade.type));
    }

    // Apply profit/loss filters
    if (filters.profitOnly) {
      result = result.filter(trade => trade.profitLoss > 0);
    }
    if (filters.lossOnly) {
      result = result.filter(trade => trade.profitLoss < 0);
    }

    // Apply notes filter
    if (filters.withNotes) {
      result = result.filter(trade => trade.notes && trade.notes.trim() !== '');
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      result = result.filter(trade => 
        trade.tags && trade.tags.some(tag => filters.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (filters.timePeriod !== 'all') {
      const now = new Date();
      let cutoffDate: Date | undefined;

      if (filters.timePeriod === 'custom' && filters.dateRange) {
        result = result.filter(trade => {
          const tradeDate = trade.closeDate;
          return (
            (!filters.dateRange?.from || tradeDate >= filters.dateRange.from) &&
            (!filters.dateRange?.to || tradeDate <= new Date(filters.dateRange.to.getTime() + 86400000 - 1))
          );
        });
      } else {
        // Standard time periods
        switch(filters.timePeriod) {
          case '1m':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case '3m':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
          case '6m':
            cutoffDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
          case '1y':
            cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        }

        if (cutoffDate) {
          result = result.filter(trade => trade.closeDate >= cutoffDate!);
        }
      }
    }

    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(trade => 
        trade.symbol.toLowerCase().includes(query) ||
        trade.type.toLowerCase().includes(query) ||
        (trade.notes && trade.notes.toLowerCase().includes(query)) ||
        (trade.tags && trade.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    return result;
  }, [trades, filters, searchQuery, availableSymbols]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setFilters(prev => ({ 
        ...prev, 
        timePeriod: 'custom',
        dateRange: range 
      }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        timePeriod: 'all',
        dateRange: undefined 
      }));
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setFilters(prev => ({ ...prev, tags }));
  };
  
  const toggleSymbolFilter = (symbol: string) => {
    setFilters(prev => {
      const currentSymbols = [...prev.symbols];
      if (currentSymbols.includes(symbol)) {
        return { ...prev, symbols: currentSymbols.filter(s => s !== symbol) };
      } else {
        return { ...prev, symbols: [...currentSymbols, symbol] };
      }
    });
  };
  
  const toggleAllSymbols = () => {
    setFilters(prev => {
      if (prev.symbols.length === availableSymbols.length) {
        return { ...prev, symbols: [] };
      } else {
        return { ...prev, symbols: [...availableSymbols] };
      }
    });
  };
  
  const toggleTradeTypeFilter = (type: 'buy' | 'sell' | 'all') => {
    setFilters(prev => {
      if (type === 'all') {
        if (prev.tradeType.includes('all')) {
          return { ...prev, tradeType: [] };
        } else {
          return { ...prev, tradeType: ['all', 'buy', 'sell'] };
        }
      } else {
        const currentTypes = prev.tradeType.filter(t => t !== 'all');
        if (currentTypes.includes(type)) {
          const newTypes = currentTypes.filter(t => t !== type);
          return { ...prev, tradeType: newTypes.length ? newTypes : [] };
        } else {
          const newTypes = [...currentTypes, type];
          return { ...prev, tradeType: newTypes.length === 2 ? [...newTypes, 'all'] : newTypes };
        }
      }
    });
  };

  return {
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
  };
};
