
import { DailyPerformance, Symbol } from '@/lib/types';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { TradingSummary } from '@/components/dashboard/TradingSummary';
import { TimePeriod } from '@/hooks/useTimePeriodFilter';

interface PerformanceOverviewProps {
  performance: DailyPerformance[];
  symbols: Symbol[];
  selectedTimePeriod: TimePeriod;
  setSelectedTimePeriod: (value: TimePeriod) => void;
}

export const PerformanceOverview = ({ 
  performance, 
  symbols,
  selectedTimePeriod,
  setSelectedTimePeriod
}: PerformanceOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PerformanceChart 
        data={performance}
        className="lg:col-span-2" 
        selectedTimePeriod={selectedTimePeriod}
        setSelectedTimePeriod={setSelectedTimePeriod}
      />
      <TradingSummary symbols={symbols} />
    </div>
  );
};
