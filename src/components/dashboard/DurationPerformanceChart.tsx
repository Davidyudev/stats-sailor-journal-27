
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Legend,
  ReferenceLine
} from 'recharts';

interface DurationPerformanceChartProps {
  trades: Trade[];
  className?: string;
}

export const DurationPerformanceChart = ({ trades, className }: DurationPerformanceChartProps) => {
  const chartData = useMemo(() => {
    return trades.map(trade => {
      const durationHours = (trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60);
      return {
        duration: parseFloat(durationHours.toFixed(2)),
        pnl: trade.profitLoss,
        symbol: trade.symbol,
        size: Math.abs(trade.profitLoss) * 0.5 + 5, // Size based on PL magnitude
      };
    });
  }, [trades]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const data = payload[0]?.payload;
    if (!data) return null;
    
    return (
      <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
        <p className="font-medium mb-1">{data.symbol}</p>
        <p className={cn(
          "font-mono text-xs",
          data.pnl >= 0 ? "text-profit" : "text-loss"
        )}>
          P/L: {data.pnl >= 0 ? "+" : ""}{data.pnl.toFixed(2)}
        </p>
        <p className="font-mono text-xs">
          Duration: {data.duration < 1 
            ? `${Math.round(data.duration * 60)} minutes` 
            : `${data.duration.toFixed(1)} hours`}
        </p>
      </div>
    );
  };

  return (
    <MountTransition delay={250} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Trade Duration vs P/L</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                type="number" 
                dataKey="duration" 
                name="Duration (hours)" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                label={{ value: 'Duration (hours)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="pnl" 
                name="Profit/Loss" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                label={{ value: 'Profit/Loss', angle: -90, position: 'insideLeft' }}
              />
              <ZAxis type="number" dataKey="size" range={[5, 25]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--neutral))" />
              <Scatter 
                name="Trades" 
                data={chartData} 
                fill="hsl(var(--primary))"
                fillOpacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
