
import { useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
}

type TimePeriod = 'all' | '1m' | '3m' | '6m' | '1y';

export const PerformanceChart = ({ data, className }: PerformanceChartProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  
  const filteredData = useMemo(() => {
    if (timePeriod === 'all') return data;
    
    const now = new Date();
    let monthsToSubtract = 0;
    
    switch(timePeriod) {
      case '1m': monthsToSubtract = 1; break;
      case '3m': monthsToSubtract = 3; break;
      case '6m': monthsToSubtract = 6; break;
      case '1y': monthsToSubtract = 12; break;
    }
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
    
    return data.filter(item => item.date >= cutoffDate);
  }, [data, timePeriod]);

  const chartData = useMemo(() => {
    // Make sure we sort the data by date first to ensure proper accumulation
    const sortedData = [...filteredData].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let accumulated = 0;
    return sortedData.map(item => {
      accumulated += item.profitLoss;
      return {
        date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        profit: item.profitLoss,
        accumulatedProfit: accumulated,
        trades: item.trades,
        winRate: item.winRate
      };
    });
  }, [filteredData]);

  const totalProfit = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.profitLoss, 0);
  }, [filteredData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    // Safely access payload values with null checks
    const dailyPL = payload.find(p => p.dataKey === 'profit')?.value ?? 0;
    const accumulated = payload.find(p => p.dataKey === 'accumulatedProfit')?.value ?? 0;
    const trades = payload.find(p => p.dataKey === 'trades')?.value ?? 0;
    const winRate = payload.find(p => p.dataKey === 'winRate')?.value ?? 0;
    
    return (
      <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className={cn(
          "font-mono text-xs",
          dailyPL >= 0 ? "text-profit" : "text-loss"
        )}>
          Daily P/L: {dailyPL >= 0 ? "+" : ""}{Number(dailyPL).toFixed(2)}
        </p>
        <p className={cn(
          "font-mono text-xs",
          accumulated >= 0 ? "text-profit" : "text-loss"
        )}>
          Accumulated: {accumulated >= 0 ? "+" : ""}{Number(accumulated).toFixed(2)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Trades: {trades}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Win Rate: {winRate ? (winRate * 100).toFixed(0) : 0}%
        </p>
      </div>
    );
  };

  return (
    <MountTransition delay={100} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Performance</h3>
          <div className="flex items-center gap-3">
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Overall</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <div className={cn(
              "text-sm font-medium",
              totalProfit >= 0 ? "text-profit" : "text-loss"
            )}>
              Total: {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)}
            </div>
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
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
                tickFormatter={(value) => `${value}`}
                domain={['auto', 'auto']}
                label={{ 
                  value: 'Daily P/L', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { 
                    textAnchor: 'middle', 
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }, 
                  offset: 0 
                }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#0EA5E9" }} 
                tickLine={false}
                stroke="#0EA5E9"
                tickFormatter={(value) => `${value}`}
                domain={['auto', 'auto']}
                label={{ 
                  value: 'Accumulated', 
                  angle: 90, 
                  position: 'insideRight', 
                  style: { 
                    textAnchor: 'middle', 
                    fill: '#0EA5E9',
                    fontWeight: 500
                  }, 
                  offset: 0 
                }}
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
                stroke="#0EA5E9" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="Accumulated P/L"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
