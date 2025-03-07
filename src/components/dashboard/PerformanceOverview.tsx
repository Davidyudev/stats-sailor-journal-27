
import { DailyPerformance, Symbol } from '@/lib/types';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { TradingSummary } from '@/components/dashboard/TradingSummary';

interface PerformanceOverviewProps {
  performance: DailyPerformance[];
  symbols: Symbol[];
}

export const PerformanceOverview = ({ performance, symbols }: PerformanceOverviewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PerformanceChart 
        data={performance}
        className="lg:col-span-2" 
      />
      <TradingSummary symbols={symbols} />
    </div>
  );
};
