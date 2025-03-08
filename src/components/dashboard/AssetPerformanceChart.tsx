
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Symbol } from '@/lib/types';
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

interface AssetPerformanceChartProps {
  data: Symbol[];
  className?: string;
}

export const AssetPerformanceChart = ({ data, className }: AssetPerformanceChartProps) => {
  const chartData = useMemo(() => {
    const sortedData = [...data]
      .sort((a, b) => b.totalPL - a.totalPL)
      .map(item => ({
        name: item.name,
        pnl: item.totalPL,
        trades: item.tradesCount,
        winRate: item.winRate
      }));

    return {
      labels: sortedData.map(item => item.name),
      datasets: [
        {
          label: 'Profit/Loss',
          data: sortedData.map(item => item.pnl),
          backgroundColor: sortedData.map(item => 
            item.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'
          ),
          borderRadius: 4,
        }
      ]
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: {
          display: true,
          text: 'Profit/Loss',
          color: 'hsl(var(--foreground))',
          font: {
            weight: '500',
          },
        },
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
          maxRotation: 45,
          minRotation: 45
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
            const dataItem = [...data]
              .sort((a, b) => b.totalPL - a.totalPL)[dataIndex];
            
            return [
              `Trades: ${dataItem.tradesCount}`,
              `Win Rate: ${dataItem.winRate}%`
            ];
          }
        }
      }
    }
  };

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Asset Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </MountTransition>
  );
};
