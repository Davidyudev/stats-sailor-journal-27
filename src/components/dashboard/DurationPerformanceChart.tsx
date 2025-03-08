
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface DurationPerformanceChartProps {
  trades: Trade[];
  className?: string;
}

export const DurationPerformanceChart = ({ trades, className }: DurationPerformanceChartProps) => {
  const { chartData, tradeItems } = useMemo(() => {
    const tradeItems = trades.map(trade => {
      const durationHours = (trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60);
      return {
        x: parseFloat(durationHours.toFixed(2)),
        y: trade.profitLoss,
        r: Math.abs(trade.profitLoss) * 0.3 + 4, // Size based on PL magnitude
        symbol: trade.symbol,
        duration: durationHours
      };
    });

    return {
      chartData: {
        datasets: [
          {
            label: 'Trades',
            data: tradeItems,
            backgroundColor: 'hsl(var(--primary))',
            borderColor: 'hsl(var(--primary))',
            borderWidth: 1,
            hoverBackgroundColor: 'hsl(var(--primary))',
            hoverBorderColor: 'white',
            pointRadius: 5,
            pointHoverRadius: 8,
          }
        ]
      },
      tradeItems
    };
  }, [trades]);
  
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
        },
        beginAtZero: false,
      },
      x: {
        title: {
          display: true,
          text: 'Duration (hours)',
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
        },
        beginAtZero: true,
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
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const dataItem = tradeItems[dataIndex];
            
            const durationText = dataItem.duration < 1 
              ? `${Math.round(dataItem.duration * 60)} minutes` 
              : `${dataItem.duration.toFixed(1)} hours`;
            
            return [
              `${dataItem.symbol}`,
              `P/L: ${dataItem.y >= 0 ? "+" : ""}${dataItem.y.toFixed(2)}`,
              `Duration: ${durationText}`
            ];
          }
        }
      }
    }
  };

  return (
    <MountTransition delay={250} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Trade Duration vs P/L</h3>
        </div>
        
        <div className="h-72 w-full">
          <Scatter data={chartData} options={options} />
        </div>
      </div>
    </MountTransition>
  );
};
