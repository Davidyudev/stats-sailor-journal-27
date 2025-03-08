
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { filterDataByTimePeriod, prepareChartData, calculateTotalProfit } from './performance-chart/utils';
import { PeriodSelector } from './performance-chart/PeriodSelector';
import { ChartComponent } from './performance-chart/ChartComponent';
import { TimePeriod } from '@/hooks/useTimePeriodFilter';

interface PerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
  selectedTimePeriod: TimePeriod;
  setSelectedTimePeriod: (value: TimePeriod) => void;
}

export const PerformanceChart = ({ 
  data, 
  className,
  selectedTimePeriod,
  setSelectedTimePeriod 
}: PerformanceChartProps) => {
  const filteredData = useMemo(() => {
    return filterDataByTimePeriod(data, selectedTimePeriod);
  }, [data, selectedTimePeriod]);

  const chartData = useMemo(() => {
    return prepareChartData(filteredData);
  }, [filteredData]);

  const totalProfit = useMemo(() => {
    return calculateTotalProfit(filteredData);
  }, [filteredData]);

  return (
    <MountTransition delay={100} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Performance</h3>
          <div className="flex items-center gap-3">
            <PeriodSelector 
              selectedTimePeriod={selectedTimePeriod} 
              setSelectedTimePeriod={setSelectedTimePeriod} 
            />
            <div className={cn(
              "text-sm font-medium",
              totalProfit >= 0 ? "text-profit" : "text-loss"
            )}>
              Total: {totalProfit >= 0 ? "+" : ""}{totalProfit.toFixed(2)}
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-h-[250px]">
          <ChartComponent data={chartData} />
        </div>
      </div>
    </MountTransition>
  );
};
