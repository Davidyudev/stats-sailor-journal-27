
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { Maximize2 } from 'lucide-react';
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
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';

interface DurationPerformanceChartProps {
  trades: Trade[];
  className?: string;
  onMaximize?: () => void;
  isDetailed?: boolean;
}

export const DurationPerformanceChart = ({ 
  trades, 
  className,
  onMaximize,
  isDetailed = false
}: DurationPerformanceChartProps) => {
  const chartData = useMemo(() => {
    return trades.map(trade => {
      const durationHours = (trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60);
      return {
        x: parseFloat(durationHours.toFixed(2)),
        y: trade.profitLoss,
        z: trade.lots,
        symbol: trade.symbol,
        type: trade.type,
        isProfit: trade.profitLoss >= 0
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
        <p className="font-medium">{data.symbol} {data.type.toUpperCase()}</p>
        <p className={cn(
          "font-mono text-xs mt-1",
          data.y >= 0 ? "text-profit" : "text-loss"
        )}>
          P/L: {data.y >= 0 ? "+" : ""}{data.y.toFixed(2)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Duration: {data.x} hours
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Lots: {data.z}
        </p>
      </div>
    );
  };

  const height = isDetailed ? 500 : 256;

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <div>
            <h3 className="text-lg font-medium">Trade Duration vs P/L</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Scatter plot showing relationship between trade duration and profit/loss
            </p>
          </div>
          {onMaximize && (
            <Button variant="ghost" size="sm" onClick={onMaximize} className="p-1 h-8 w-8">
              <Maximize2 size={16} />
            </Button>
          )}
        </div>
        
        <div className={`w-full h-[${height}px]`} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="x" 
                name="Duration" 
                type="number"
                label={{ 
                  value: 'Duration (hours)', 
                  position: 'insideBottom', 
                  offset: -15,
                  style: { 
                    textAnchor: 'middle', 
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }
                }}
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                dataKey="y" 
                name="Profit/Loss"
                label={{ 
                  value: 'Profit/Loss', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { 
                    textAnchor: 'middle', 
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }
                }}
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <ZAxis dataKey="z" range={[30, 200]} name="Volume" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Scatter 
                name="Trades" 
                data={chartData} 
                fill="hsl(var(--primary))"
                shape="circle"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isProfit ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
