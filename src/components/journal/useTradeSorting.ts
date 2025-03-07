
import { useState, useMemo } from 'react';
import { Trade } from '@/lib/types';

export const useTradeSorting = (trades: Trade[]) => {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade;
    direction: 'asc' | 'desc';
  }>({
    key: 'closeDate',
    direction: 'desc',
  });

  const handleSort = (key: keyof Trade) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
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
  }, [trades, sortConfig]);

  return {
    sortConfig,
    handleSort,
    sortedTrades
  };
};
