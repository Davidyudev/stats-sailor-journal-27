
import { useMemo, lazy, Suspense } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Symbol } from '@/lib/types';

// Use React's lazy loading instead of Next.js dynamic imports
const ApexChart = lazy(() => import('react-apexcharts'));

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
      series: [{
        name: 'Profit/Loss',
        data: sortedData.map(item => item.pnl)
      }],
      chartOptions: {
        chart: {
          type: 'bar',
          toolbar: {
            show: false
          },
          background: 'transparent',
        },
        colors: sortedData.map(item => 
          item.pnl >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'
        ),
        plotOptions: {
          bar: {
            borderRadius: 4,
            horizontal: false,
          }
        },
        dataLabels: {
          enabled: false
        },
        xaxis: {
          categories: sortedData.map(item => item.name),
          labels: {
            style: {
              colors: 'hsl(var(--foreground))'
            },
            rotate: -45,
            rotateAlways: true
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          title: {
            text: 'Profit/Loss',
            style: {
              color: 'hsl(var(--foreground))',
              fontWeight: 500
            }
          },
          labels: {
            style: {
              colors: 'hsl(var(--foreground))'
            }
          }
        },
        grid: {
          borderColor: 'hsl(var(--chart-grid))',
          strokeDashArray: 4,
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val >= 0 ? "+" : ""}${val.toFixed(2)}`
          },
          custom: function({ series, seriesIndex, dataPointIndex }: any) {
            const dataItem = [...data]
              .sort((a, b) => b.totalPL - a.totalPL)[dataPointIndex];
            
            return `<div class="apexcharts-tooltip-box">
              <span><strong>${dataItem.name}</strong></span><br/>
              <span>P/L: ${series[seriesIndex][dataPointIndex] >= 0 ? "+" : ""}${series[seriesIndex][dataPointIndex].toFixed(2)}</span><br/>
              <span>Trades: ${dataItem.tradesCount}</span><br/>
              <span>Win Rate: ${dataItem.winRate}%</span>
            </div>`;
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
  }, [data]);

  return (
    <MountTransition delay={150} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Asset Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          {typeof window !== 'undefined' && (
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center">Loading chart...</div>}>
              <ApexChart 
                options={chartData.chartOptions as ApexCharts.ApexOptions}
                series={chartData.series}
                type="bar"
                height="100%"
              />
            </Suspense>
          )}
        </div>
      </div>
    </MountTransition>
  );
};
