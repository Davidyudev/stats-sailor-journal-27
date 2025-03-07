
import { useMemo, useState } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { filterDataByTimePeriod, prepareChartData, calculateTotalProfit, TimePeriod } from './performance-chart/utils';
import { PeriodSelector } from './performance-chart/PeriodSelector';
import { ChartComponent } from './performance-chart/ChartComponent';

interface PerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
}

export const PerformanceChart = ({ data, className }: PerformanceChartProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  
  const filteredData = useMemo(() => {
    return filterDataByTimePeriod(data, timePeriod);
  }, [data, timePeriod]);

  const chartData = useMemo(() => {
    return prepareChartData(filteredData);
  }, [filteredData]);

  const totalProfit = useMemo(() => {
    return calculateTotalProfit(filteredData);
  }, [filteredData]);

  return (
    <MountTransition delay={100} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Performance</h3>
          <div className="flex items-center gap-3">
            <PeriodSelector 
              value={timePeriod} 
              onChange={(value) => setTimePeriod(value)} 
            />
            <div className={cn(
              "text-sm font-medium",
              totalProfit >= 0 ? "text-profit" : "text-loss"
            )}>
              Total: {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)}
            </div>
          </div>
        </div>
        
        <ChartComponent data={chartData} />
      </div>
    </MountTransition>
  );
};
