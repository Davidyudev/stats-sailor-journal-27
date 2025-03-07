
import { Trade } from '@/lib/types';
import { StatCard } from '@/components/dashboard/StatCard';
import { Activity, TrendingUp, Wallet, BarChart } from 'lucide-react';

interface StatisticsCardsProps {
  filteredTrades: Trade[];
}

export const StatisticsCards = ({ filteredTrades }: StatisticsCardsProps) => {
  // Calculate statistics based on filtered trades
  const totalProfitLoss = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);
  const winningTrades = filteredTrades.filter(trade => trade.profitLoss > 0);
  const winRate = filteredTrades.length > 0 ? (winningTrades.length / filteredTrades.length) * 100 : 0;
  const avgPips = filteredTrades.length > 0 
    ? filteredTrades.reduce((sum, trade) => sum + trade.pips, 0) / filteredTrades.length 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Wallet size={24} />}
        title="Total Profit/Loss"
        value={`$${totalProfitLoss.toFixed(2)}`}
        change={{
          value: "12.5%",
          positive: totalProfitLoss > 0
        }}
        delay={50}
      />
      <StatCard
        icon={<Activity size={24} />}
        title="Win Rate"
        value={`${winRate.toFixed(1)}%`}
        change={{
          value: "3.2%",
          positive: true
        }}
        delay={100}
      />
      <StatCard
        icon={<TrendingUp size={24} />}
        title="Average Pips"
        value={avgPips.toFixed(1)}
        change={{
          value: "0.8",
          positive: avgPips > 0
        }}
        delay={150}
      />
      <StatCard
        icon={<BarChart size={24} />}
        title="Total Trades"
        value={filteredTrades.length}
        change={{
          value: "5",
          positive: true
        }}
        delay={200}
      />
    </div>
  );
};
