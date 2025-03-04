
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
    let accumulatedProfit = 0;
    
    return data.map(item => {
      accumulatedProfit += item.profitLoss;
      
      return {
        date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dailyProfit: item.profitLoss,
        accumulatedProfit: accumulatedProfit,
        trades: item.trades,
        winRate: item.winRate
      };
    });
  }, [data]);

  const totalProfit = useMemo(() => {
    return data.reduce((sum, item) => sum + item.profitLoss, 0);
  }, [data]);

  // Calculate Y-axis domains for better visualization
  const maxDailyValue = Math.max(
    ...chartData.map(d => Math.abs(d.dailyProfit)),
    10 // Minimum value to prevent empty chart when all values are near zero
  );
  
  const maxAccumulatedValue = Math.max(
    ...chartData.map(d => Math.abs(d.accumulatedProfit)),
    10 // Minimum value to prevent empty chart when all values are near zero
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
          <p className="font-medium mb-1">{label}</p>
          <p className={cn(
            "font-mono text-xs",
            payload[0].value >= 0 ? "text-profit" : "text-loss"
          )}>
            Daily P/L: {payload[0].value >= 0 ? "+" : ""}{payload[0].value.toFixed(2)}
          </p>
          <p className={cn(
            "font-mono text-xs",
            payload[1].value >= 0 ? "text-profit" : "text-loss"
          )}>
            Accumulated: {payload[1].value >= 0 ? "+" : ""}{payload[1].value.toFixed(2)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Trades: {payload[2].value}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Win Rate: {(payload[3].value * 100).toFixed(0)}%
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
            <ComposedChart
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
                yAxisId="left"
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                domain={[-(maxDailyValue * 1.1), maxDailyValue * 1.1]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                domain={[-(maxAccumulatedValue * 1.1), maxAccumulatedValue * 1.1]}
                tickFormatter={(value) => `${value.toFixed(1)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="hsl(var(--neutral))" />
              <Bar 
                yAxisId="left"
                dataKey="dailyProfit" 
                name="Daily P/L"
                fill={theme => {
                  return "hsl(var(--primary))";
                }}
                fillOpacity={0.8}
                barSize={20}
                isAnimationActive={true}
                animationDuration={1500}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="accumulatedProfit" 
                name="Accumulated"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ r: 2 }}
                isAnimationActive={true}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="trades" 
                stroke="transparent"
                fill="transparent"
              />
              <Line 
                type="monotone" 
                dataKey="winRate" 
                stroke="transparent"
                fill="transparent"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
