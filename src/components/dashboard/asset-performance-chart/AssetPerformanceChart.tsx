
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
        
        <div className="h-64 w-full mb-2">
          <AssetChartRenderer data={sortedData} />
        </div>
        
        {/* Asset descriptions at the bottom */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {sortedData.map((asset) => (
            <div key={asset.name} className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2" 
                style={{ 
                  backgroundColor: asset.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'
                }} 
              />
              <span className="font-medium">{asset.name}:</span>
              <span className="ml-1">{asset.trades} trades,</span>
              <span className="ml-1">{asset.winRate}% win,</span>
              <span className={cn(
                "ml-1 font-semibold",
                asset.pnl >= 0 ? "text-success" : "text-destructive"
              )}>
                {asset.pnl >= 0 ? '+' : ''}{asset.pnl.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </MountTransition>
  );
};
