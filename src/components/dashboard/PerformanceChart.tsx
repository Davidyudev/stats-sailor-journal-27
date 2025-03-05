
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';

interface PerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
}

export const PerformanceChart = ({ data, className }: PerformanceChartProps) => {
  const chartData = useMemo(() => {
    let accumulated = 0;
    return data.map(item => {
      accumulated += item.profitLoss;
      return {
        date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        profit: item.profitLoss,
        accumulatedProfit: accumulated,
        trades: item.trades,
        winRate: item.winRate
      };
    });
  }, [data]);

  const totalProfit = useMemo(() => {
    return data.reduce((sum, item) => sum + item.profitLoss, 0);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    // Safely access payload values with null checks
    const dailyPL = payload[0]?.value !== undefined ? payload[0].value : 0;
    const accumulated = payload[1]?.value !== undefined ? payload[1].value : 0;
    const trades = payload[2]?.value !== undefined ? payload[2].value : 0;
    const winRate = payload[3]?.value !== undefined ? payload[3].value : 0;
    
    return (
      <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className={cn(
          "font-mono text-xs",
          dailyPL >= 0 ? "text-profit" : "text-loss"
        )}>
          Daily P/L: {dailyPL >= 0 ? "+" : ""}{dailyPL.toFixed(2)}
        </p>
        <p className={cn(
          "font-mono text-xs",
          accumulated >= 0 ? "text-profit" : "text-loss"
        )}>
          Accumulated: {accumulated >= 0 ? "+" : ""}{accumulated.toFixed(2)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Trades: {trades}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Win Rate: {(winRate * 100).toFixed(0)}%
        </p>
      </div>
    );
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
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                tickFormatter={(value) => `${value}`}
                domain={['auto', 'auto']}
                label={{ value: 'Daily P/L', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }, offset: 0 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value}`}
                domain={['auto', 'auto']}
                label={{ value: 'Accumulated', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }, offset: 0 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--neutral))" />
              <Bar 
                yAxisId="left"
                dataKey="profit" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="Daily P/L"
                isAnimationActive={true}
                animationDuration={1500}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="accumulatedProfit" 
                stroke="hsl(var(--warning))" 
                dot={false}
                name="Accumulated P/L"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
