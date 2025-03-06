
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { Maximize2 } from 'lucide-react';
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
  Cell
} from 'recharts';
import { Button } from '@/components/ui/button';

interface MonthlyPerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
  onMaximize?: () => void;
  isDetailed?: boolean;
}

export const MonthlyPerformanceChart = ({ 
  data,
  className,
  onMaximize,
  isDetailed = false
}: MonthlyPerformanceChartProps) => {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string, profitLoss: number, trades: number, winRate: number }> = {};
    
    data.forEach(day => {
      const month = day.date.toLocaleString('default', { month: 'short' });
      const year = day.date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = {
          month: key,
          profitLoss: 0,
          trades: 0,
          winRate: 0
        };
      }
      
      monthlyData[key].profitLoss += day.profitLoss;
      monthlyData[key].trades += day.trades;
      
      // Recalculate win rate (weighted average)
      const totalTrades = monthlyData[key].trades;
      monthlyData[key].winRate = 
        ((monthlyData[key].winRate * (totalTrades - day.trades)) + 
        (day.winRate * day.trades)) / totalTrades;
    });
    
    return Object.values(monthlyData).sort((a, b) => {
      // Sort by date (assuming format "MMM YYYY")
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      if (aYear !== bYear) {
        return Number(aYear) - Number(bYear);
      }
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    const data = payload[0]?.payload;
    if (!data) return null;
    
    return (
      <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
        <p className="font-medium mb-1">{data.month}</p>
        <p className={cn(
          "font-mono text-xs",
          data.profitLoss >= 0 ? "text-profit" : "text-loss"
        )}>
          P/L: {data.profitLoss >= 0 ? "+" : ""}{data.profitLoss.toFixed(2)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Trades: {data.trades}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Win Rate: {(data.winRate * 100).toFixed(1)}%
        </p>
      </div>
    );
  };

  const height = isDetailed ? 500 : 256;

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Monthly Performance</h3>
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
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="profitLoss" 
                name="Profit/Loss"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profitLoss >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
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
