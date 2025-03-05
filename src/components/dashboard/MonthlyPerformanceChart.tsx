
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

interface MonthlyPerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
}

export const MonthlyPerformanceChart = ({ data, className }: MonthlyPerformanceChartProps) => {
  const chartData = useMemo(() => {
    // Group data by month
    const monthlyData: Record<string, { month: string, profit: number, trades: number, winRate: number }> = {};
    
    data.forEach(item => {
      const month = item.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          profit: 0,
          trades: 0,
          winRate: 0
        };
      }
      
      monthlyData[month].profit += item.profitLoss;
      monthlyData[month].trades += item.trades;
    });
    
    // Calculate win rate for each month
    Object.keys(monthlyData).forEach(month => {
      const monthData = data.filter(item => 
        item.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) === month
      );
      
      const totalWins = monthData.reduce((sum, item) => sum + (item.winRate * item.trades), 0);
      const totalTrades = monthData.reduce((sum, item) => sum + item.trades, 0);
      
      monthlyData[month].winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    });
    
    return Object.values(monthlyData);
  }, [data]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
          <p className="font-medium mb-1">{payload[0].payload.month}</p>
          <p className={cn(
            "font-mono text-xs",
            payload[0].value >= 0 ? "text-profit" : "text-loss"
          )}>
            Profit/Loss: {payload[0].value >= 0 ? "+" : ""}{payload[0].value.toFixed(2)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Trades: {payload[0].payload.trades}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Win Rate: {payload[0].payload.winRate.toFixed(1)}%
          </p>
        </div>
      );
    }
  
    return null;
  };

  return (
    <MountTransition delay={200} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Monthly Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                stroke="hsl(var(--chart-grid))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="profit" 
                name="Monthly P/L"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profit >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
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
