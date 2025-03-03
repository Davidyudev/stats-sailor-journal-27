
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface PerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
}

export const PerformanceChart = ({ data, className }: PerformanceChartProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: item.profitLoss,
      trades: item.trades,
      winRate: item.winRate
    }));
  }, [data]);

  const totalProfit = useMemo(() => {
    return data.reduce((sum, item) => sum + item.profitLoss, 0);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
          <p className="font-medium mb-1">{label}</p>
          <p className={cn(
            "font-mono text-xs",
            payload[0].value >= 0 ? "text-profit" : "text-loss"
          )}>
            Profit/Loss: {payload[0].value >= 0 ? "+" : ""}{payload[0].value.toFixed(2)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Trades: {payload[1].value}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Win Rate: {(payload[2].value * 100).toFixed(0)}%
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <MountTransition delay={100} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Performance</h3>
          <div className={cn(
            "text-sm font-medium",
            totalProfit >= 0 ? "text-profit" : "text-loss"
          )}>
            Total: {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)}
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="hsl(var(--neutral))" />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorProfit)" 
                isAnimationActive={true}
                animationDuration={1500}
              />
              <Area 
                type="monotone" 
                dataKey="trades" 
                stroke="transparent"
                fill="transparent"
              />
              <Area 
                type="monotone" 
                dataKey="winRate" 
                stroke="transparent"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
