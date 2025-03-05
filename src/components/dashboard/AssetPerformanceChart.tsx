
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
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

interface AssetPerformanceChartProps {
  data: Symbol[];
  className?: string;
}

export const AssetPerformanceChart = ({ data, className }: AssetPerformanceChartProps) => {
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
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
          <p className="font-medium mb-1">{payload[0].payload.name}</p>
          <p className={cn(
            "font-mono text-xs",
            payload[0].value >= 0 ? "text-profit" : "text-loss"
          )}>
            P/L: {payload[0].value >= 0 ? "+" : ""}{payload[0].value.toFixed(2)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Trades: {payload[0].payload.trades}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Win Rate: {payload[0].payload.winRate}%
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Asset Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
              />
              <YAxis 
                dataKey="name"
                type="category"
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                width={60}
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
