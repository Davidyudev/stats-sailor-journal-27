
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { Trade } from '@/lib/types';
import dynamic from 'next/dynamic';
import ReactApexChart from 'react-apexcharts';

// Use dynamic import with SSR disabled as ApexCharts requires window
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DurationPerformanceChartProps {
  trades: Trade[];
  className?: string;
}

export const DurationPerformanceChart = ({ trades, className }: DurationPerformanceChartProps) => {
  const chartData = useMemo(() => {
    const tradeItems = trades.map(trade => {
      const durationHours = (trade.closeDate.getTime() - trade.openDate.getTime()) / (1000 * 60 * 60);
      return {
        x: parseFloat(durationHours.toFixed(2)),
        y: trade.profitLoss,
        symbol: trade.symbol,
        duration: durationHours
      };
    });

    return {
      series: [{
        name: 'Trades',
        data: tradeItems
      }],
      chartOptions: {
        chart: {
          type: 'scatter',
          zoom: {
            enabled: true,
            type: 'xy'
          },
          toolbar: {
            show: false
          },
          background: 'transparent'
        },
        colors: ['hsl(var(--primary))'],
        markers: {
          size: 6,
          strokeWidth: 1,
          hover: {
            size: 9
          }
        },
        grid: {
          borderColor: 'hsl(var(--chart-grid))',
          strokeDashArray: 4
        },
        xaxis: {
          title: {
            text: 'Duration (hours)',
            style: {
              color: 'hsl(var(--foreground))',
              fontWeight: 500
            }
          },
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
            },
            formatter: (val: number) => val.toFixed(2)
          }
        },
        tooltip: {
          custom: function({ series, seriesIndex, dataPointIndex }: any) {
            const dataItem = tradeItems[dataPointIndex];
            const durationText = dataItem.duration < 1 
              ? `${Math.round(dataItem.duration * 60)} minutes` 
              : `${dataItem.duration.toFixed(1)} hours`;
            
            return `<div class="apexcharts-tooltip-box">
              <span><strong>${dataItem.symbol}</strong></span><br/>
              <span>P/L: ${dataItem.y >= 0 ? "+" : ""}${dataItem.y.toFixed(2)}</span><br/>
              <span>Duration: ${durationText}</span>
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
  }, [trades]);

  return (
    <MountTransition delay={250} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Trade Duration vs P/L</h3>
        </div>
        
        <div className="h-72 w-full">
          {typeof window !== 'undefined' && (
            <Chart 
              options={chartData.chartOptions as ApexCharts.ApexOptions}
              series={chartData.series}
              type="scatter"
              height="100%"
            />
          )}
        </div>
      </div>
    </MountTransition>
  );
};
