
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Symbol } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';

interface AssetPerformanceChartProps {
  data: Symbol[];
  className?: string;
  onMaximize?: () => void;
  isDetailed?: boolean;
}

export const AssetPerformanceChart = ({ 
  data, 
  className,
  onMaximize,
  isDetailed = false
}: AssetPerformanceChartProps) => {
  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => b.totalPL - a.totalPL)
      .map(item => ({
        name: item.name,
        pnl: item.totalPL,
        trades: item.tradesCount,
        winRate: item.winRate
      }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const data = payload[0]?.payload;
    if (!data) return null;
    
    return (
      <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
        <p className="font-medium mb-1">{data.name}</p>
        <p className={cn(
          "font-mono text-xs",
          data.pnl >= 0 ? "text-profit" : "text-loss"
        )}>
          P/L: {data.pnl >= 0 ? "+" : ""}{data.pnl.toFixed(2)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Trades: {data.trades}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Win Rate: {data.winRate}%
        </p>
      </div>
    );
  };

  const height = isDetailed ? 500 : 256;

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Asset Performance</h3>
          {onMaximize && (
            <Button variant="ghost" size="sm" onClick={onMaximize} className="p-1 h-8 w-8">
              <Maximize2 size={16} />
            </Button>
          )}
        </div>
        
        <div className={`w-full h-[${height}px]`} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                label={{ 
                  value: 'Profit/Loss', 
                  position: 'insideBottom', 
                  offset: -15,
                  style: { 
                    textAnchor: 'middle', 
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }
                }}
              />
              <YAxis 
                dataKey="name"
                type="category"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                width={70}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="pnl" 
                name="Profit/Loss"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pnl >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
