
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyPerformanceChartProps {
  data: DailyPerformance[];
  className?: string;
}

export const MonthlyPerformanceChart = ({ data, className }: MonthlyPerformanceChartProps) => {
  const { chartData, monthData } = useMemo(() => {
    // Group data by month
    const monthlyData: Record<string, { month: string, profit: number, trades: number, winRate: number }> = {};
    
    data.forEach(item => {
      const month = item.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          profit: 0,
          trades: 0,
          winRate: 0
        };
      }
      
      monthlyData[month].profit += item.profitLoss;
      monthlyData[month].trades += item.trades;
    });
    
    // Calculate win rate for each month
    Object.keys(monthlyData).forEach(month => {
      const monthData = data.filter(item => 
        item.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) === month
      );
      
      const totalWins = monthData.reduce((sum, item) => sum + (item.winRate * item.trades), 0);
      const totalTrades = monthData.reduce((sum, item) => sum + item.trades, 0);
      
      monthlyData[month].winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    });
    
    const monthDataArray = Object.values(monthlyData);
    
    return {
      chartData: {
        labels: monthDataArray.map(item => item.month),
        datasets: [
          {
            label: 'Monthly P/L',
            data: monthDataArray.map(item => item.profit),
            backgroundColor: monthDataArray.map(item => 
              item.profit >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'
            ),
            borderRadius: 4,
          }
        ]
      },
      monthData: monthDataArray
    };
  }, [data]);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: {
          color: 'hsl(var(--chart-grid))',
        },
        ticks: {
          color: 'hsl(var(--foreground))',
        }
      },
      x: {
        grid: {
          color: 'hsl(var(--chart-grid))',
        },
        ticks: {
          color: 'hsl(var(--foreground))',
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(var(--foreground))',
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const dataItem = monthData[dataIndex];
            
            return [
              `Trades: ${dataItem.trades}`,
              `Win Rate: ${dataItem.winRate.toFixed(1)}%`
            ];
          }
        }
      }
    }
  };

  return (
    <MountTransition delay={200} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Monthly Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </MountTransition>
  );
};
