
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Cell
} from 'recharts';
import DateRangeFilter, { TimePeriod } from '@/components/filters/DateRangeFilter';

interface PerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
}

export const PerformanceChart = ({ 
  data, 
  className,
  selectedPeriod,
  setSelectedPeriod,
  startDate,
  endDate,
  setStartDate,
  setEndDate
}: PerformanceChartProps) => {
  const chartData = useMemo(() => {
    // Filter data based on time period
    let filteredData = [...data];
    
    if (selectedPeriod === 'custom' && startDate && endDate) {
      filteredData = data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else if (selectedPeriod !== 'all') {
      const now = new Date();
      let monthsToSubtract = 0;
      
      switch(selectedPeriod) {
        case '1m': monthsToSubtract = 1; break;
        case '3m': monthsToSubtract = 3; break;
        case '6m': monthsToSubtract = 6; break;
        case '1y': monthsToSubtract = 12; break;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setMonth(now.getMonth() - monthsToSubtract);
      
      filteredData = data.filter(item => new Date(item.date) >= cutoffDate);
    }
    
    // Sort by date
    filteredData.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Calculate accumulated P/L
    let accumulatedPL = 0;
    
    return filteredData.map(item => {
      const date = new Date(item.date);
      accumulatedPL += item.profitLoss;
      
      return {
        date: date.toLocaleDateString(),
        profitLoss: item.profitLoss,
        accumulatedPL: accumulatedPL,
        trades: item.trades,
        winRate: item.winRate * 100,
      };
    });
  }, [data, selectedPeriod, startDate, endDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) {
      return null;
    }
    
    return (
      <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className={cn(
          "font-mono text-xs",
          payload[1]?.value >= 0 ? "text-profit" : "text-loss"
        )}>
          P/L: {payload[1]?.value >= 0 ? "+" : ""}{payload[1]?.value.toFixed(2)}
        </p>
        <p className={cn(
          "font-mono text-xs",
          payload[0]?.value >= 0 ? "text-profit" : "text-loss"
        )}>
          Accumulated P/L: {payload[0]?.value >= 0 ? "+" : ""}{payload[0]?.value.toFixed(2)}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Trades: {payload[2]?.value}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          Win Rate: {payload[3]?.value.toFixed(1)}%
        </p>
      </div>
    );
  };

  return (
    <MountTransition delay={100} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <h3 className="text-lg font-medium">Trading Performance</h3>
          <DateRangeFilter
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                label={{ 
                  value: 'Daily P/L', 
                  angle: -90, 
                  position: 'insideLeft', 
                  style: { 
                    textAnchor: 'middle', 
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }
                }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
                tickLine={false}
                stroke="hsl(var(--muted-foreground))"
                label={{ 
                  value: 'Accumulated P/L', 
                  angle: 90, 
                  position: 'insideRight', 
                  style: { 
                    textAnchor: 'middle', 
                    fill: 'hsl(var(--foreground))',
                    fontWeight: 500
                  }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accumulatedPL"
                name="Accumulated P/L"
                stroke="#0EA5E9"
                strokeWidth={3}
                dot={false}
              />
              <Bar 
                yAxisId="left"
                dataKey="profitLoss" 
                name="Daily P/L"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.profitLoss >= 0 ? "hsl(var(--profit))" : "hsl(var(--loss))"}
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </MountTransition>
  );
};
