
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DurationPerformanceChartProps {
  trades: Trade[];
  className?: string;
}

export const DurationPerformanceChart = ({ trades, className }: DurationPerformanceChartProps) => {
  const chartData = useMemo(() => {
    // Define duration categories (in hours)
    const categories = [
      { name: "Short (<1h)", max: 1, count: 0, pnl: 0 },
      { name: "Medium (1-4h)", max: 4, count: 0, pnl: 0 },
      { name: "Long (4-24h)", max: 24, count: 0, pnl: 0 },
      { name: "Very Long (>24h)", max: Infinity, count: 0, pnl: 0 }
    ];
    
    trades.forEach(trade => {
      const durationHours = (trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60);
      
      for (const category of categories) {
        if (durationHours <= category.max) {
          category.count++;
          category.pnl += trade.profitLoss;
          break;
        }
      }
    });
    
    // Filter out empty categories and calculate percentage
    return categories
      .filter(cat => cat.count > 0)
      .map(cat => ({
        name: cat.name,
        value: cat.count,
        pnl: cat.pnl,
        percentage: Math.round((cat.count / trades.length) * 100)
      }));
  }, [trades]);
  
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))'];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
          <p className="font-medium mb-1">{data.name}</p>
          <p className="font-mono text-xs">Trades: {data.value} ({data.percentage}%)</p>
          <p className={cn(
            "font-mono text-xs",
            data.pnl >= 0 ? "text-profit" : "text-loss"
          )}>
            P/L: {data.pnl >= 0 ? "+" : ""}{data.pnl.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <MountTransition delay={250} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Trade Duration</h3>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
