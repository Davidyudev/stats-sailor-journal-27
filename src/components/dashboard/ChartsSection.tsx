
import { DailyPerformance, Trade, Symbol } from '@/lib/types';
import { AssetPerformanceChart } from '@/components/dashboard/AssetPerformanceChart';
import { MonthlyPerformanceChart } from '@/components/dashboard/MonthlyPerformanceChart';
import { DurationPerformanceChart } from '@/components/dashboard/DurationPerformanceChart';

interface ChartsSectionProps {
  filteredSymbols: Symbol[];
  filteredPerformance: DailyPerformance[];
  filteredTrades: Trade[];
}

export const ChartsSection = ({ 
  filteredSymbols, 
  filteredPerformance, 
  filteredTrades 
}: ChartsSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AssetPerformanceChart data={filteredSymbols} />
      <MonthlyPerformanceChart data={filteredPerformance} />
      <DurationPerformanceChart trades={filteredTrades} />
    </div>
  );
};
