
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Symbol } from '@/lib/types';
import { AssetChartRenderer } from './AssetChartRenderer';

interface AssetPerformanceChartProps {
  data: Symbol[];
  className?: string;
}

export const AssetPerformanceChart = ({ data, className }: AssetPerformanceChartProps) => {
  const sortedData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalPL - a.totalPL)
      .map(item => ({
        name: item.name,
        pnl: item.totalPL,
        trades: item.tradesCount,
        winRate: item.winRate
      }));
  }, [data]);

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Asset Performance</h3>
        </div>
        
        <div className="h-64 w-full mb-4">
          <AssetChartRenderer data={sortedData} />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {sortedData.map((asset) => (
            <div key={asset.name} className="flex items-center p-1 rounded">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ 
                  backgroundColor: asset.pnl >= 0 ? 'var(--chart-green)' : 'var(--chart-red)'
                }}
              />
              <span className="font-medium">{asset.name}</span>
            </div>
          ))}
        </div>
      </div>
    </MountTransition>
  );
};
