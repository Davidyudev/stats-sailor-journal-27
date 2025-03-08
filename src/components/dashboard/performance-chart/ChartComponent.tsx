
import { ReactNode, useRef, useEffect, lazy, Suspense } from 'react';
import ReactApexChart from 'react-apexcharts';

// Use React's lazy loading instead of Next.js dynamic imports
const ApexChart = lazy(() => import('react-apexcharts'));

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
    series: [
      {
        name: 'Daily P/L',
        type: 'column',
        data: data.map(item => item.profit)
      },
      {
        name: 'Accumulated P/L',
        type: 'line',
        data: data.map(item => item.accumulatedProfit)
      }
    ],
    chartOptions: {
      chart: {
        type: 'line',
        stacked: false,
        height: 350,
        toolbar: {
          show: false
        },
        background: 'transparent'
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth'
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      colors: ['hsl(var(--primary))', '#0EA5E9'],
      fill: {
        opacity: [1, 1]
      },
      markers: {
        size: [0, 0],
        hover: {
          size: 6
        }
      },
      xaxis: {
        categories: data.map(item => item.date),
        labels: {
          style: {
            colors: 'hsl(var(--foreground))'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: [
        {
          seriesName: 'Daily P/L',
          title: {
            text: 'Daily P/L',
            style: {
              color: 'hsl(var(--foreground))',
              fontWeight: 500
            }
          },
          min: -absMax,
          max: absMax,
          labels: {
            style: {
              colors: 'hsl(var(--foreground))'
            },
            formatter: (val: number) => val.toFixed(0)
          }
        },
        {
          seriesName: 'Accumulated P/L',
          opposite: true,
          title: {
            text: 'Accumulated',
            style: {
              color: '#0EA5E9',
              fontWeight: 500
            }
          },
          min: -Math.max(maxAccumulated, 1),
          max: Math.max(maxAccumulated, 1),
          labels: {
            style: {
              colors: '#0EA5E9'
            },
            formatter: (val: number) => val.toFixed(0)
          }
        }
      ],
      grid: {
        borderColor: 'hsl(var(--chart-grid))',
        strokeDashArray: 4
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function(y: number, { seriesIndex }: { seriesIndex: number }) {
            if (typeof y !== 'undefined') {
              return `${y >= 0 ? "+" : ""}${y.toFixed(2)}`;
            }
            return y;
          }
        }
      },
      legend: {
        labels: {
          colors: 'hsl(var(--foreground))'
        }
      },
      theme: {
        mode: 'dark'
      }
    }
  };

  return (
    <div className="h-64 w-full">
      {typeof window !== 'undefined' && (
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
          <ApexChart 
            options={chartData.chartOptions as ApexCharts.ApexOptions}
            series={chartData.series}
            type="line"
            height="100%"
          />
        </Suspense>
      )}
    </div>
  );
};
