
import { ReactNode, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CustomTooltip } from './CustomTooltip';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

interface ChartComponentProps {
  data: any[];
}

export const ChartComponent = ({ data }: ChartComponentProps) => {
  // Find maximum values for scaling
  const maxAccumulated = Math.max(...data.map(item => item.accumulatedProfit || 0));
  const dailyValues = data.map(item => item.profit || 0);
  const minDailyValue = Math.min(...dailyValues);
  const maxDailyValue = Math.max(...dailyValues);
  
  // Calculate the absolute max for proper scaling
  const absMax = Math.max(Math.abs(minDailyValue), Math.abs(maxDailyValue));
  
  // Prepare chart data
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Daily P/L',
        data: data.map(item => item.profit),
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Accumulated P/L',
        data: data.map(item => item.accumulatedProfit),
        borderColor: '#0EA5E9',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        yAxisID: 'y1',
        tension: 0.1,
      },
    ],
  };

  // Configure chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Daily P/L',
          color: 'hsl(var(--foreground))',
          font: {
            weight: '500',
          },
        },
        min: -absMax,
        max: absMax,
        grid: {
          color: 'hsl(var(--chart-grid))',
        },
        ticks: {
          color: 'hsl(var(--foreground))',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Accumulated',
          color: '#0EA5E9',
          font: {
            weight: '500',
          },
        },
        min: 0,
        max: Math.max(maxAccumulated, 1), // Ensure at least 1 to avoid empty charts
        grid: {
          drawOnChartArea: false,
          color: '#0EA5E9',
          borderDash: [3, 3],
          borderDashOffset: 0.5,
        },
        ticks: {
          color: '#0EA5E9',
        },
      },
      x: {
        grid: {
          color: 'hsl(var(--chart-grid))',
        },
        ticks: {
          color: 'hsl(var(--foreground))',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(var(--foreground))',
        },
      },
      tooltip: {
        enabled: false, // Disable default tooltip
        external: function(context: any) {
          // This is where we could implement a custom tooltip
          // However, since Chart.js's tooltip system is quite different from Recharts,
          // we'll leave this as a placeholder for now
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
};
