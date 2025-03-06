
import { Statistics } from '@/lib/types';
import { StatCard } from '@/components/dashboard/StatCard';
import { TrendingUp, BarChart2, PieChart } from 'lucide-react';

interface StatsOverviewProps {
  stats: Statistics;
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        icon={<TrendingUp size={20} />} 
        title="Overall Win Rate" 
        value={`${stats.winRate}%`}
        change={{ value: "2.3%", positive: true }}
        delay={100}
      />
      <StatCard 
        icon={<BarChart2 size={20} />} 
        title="Profit Factor" 
        value={stats.profitFactor.toFixed(2)}
        change={{ value: "0.12", positive: true }}
        delay={200}
      />
      <StatCard 
        icon={<PieChart size={20} />} 
        title="Expectancy" 
        value={stats.expectancy.toFixed(2)}
        change={{ value: "0.05", positive: true }}
        delay={300}
      />
    </div>
  );
};
