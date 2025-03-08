
import { useMemo } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import dynamic from 'next/dynamic';
import ReactApexChart from 'react-apexcharts';

// Use dynamic import with SSR disabled as ApexCharts requires window
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
        series: [{
          name: 'Monthly P/L',
          data: monthDataArray.map(item => item.profit)
        }],
        chartOptions: {
          chart: {
            type: 'bar',
            toolbar: {
              show: false
            },
            background: 'transparent'
          },
          colors: monthDataArray.map(item => 
            item.profit >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'
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
            categories: monthDataArray.map(item => item.month),
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
            labels: {
              style: {
                colors: 'hsl(var(--foreground))'
              },
              formatter: (val: number) => val.toFixed(0)
            }
          },
          grid: {
            borderColor: 'hsl(var(--chart-grid))',
            strokeDashArray: 4
          },
          tooltip: {
            custom: function({ series, seriesIndex, dataPointIndex }: any) {
              const dataItem = monthData[dataPointIndex];
              
              return `<div class="apexcharts-tooltip-box">
                <span><strong>${dataItem.month}</strong></span><br/>
                <span>P/L: ${series[seriesIndex][dataPointIndex] >= 0 ? "+" : ""}${series[seriesIndex][dataPointIndex].toFixed(2)}</span><br/>
                <span>Trades: ${dataItem.trades}</span><br/>
                <span>Win Rate: ${dataItem.winRate.toFixed(1)}%</span>
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
      },
      monthData: monthDataArray
    };
  }, [data]);
  
  return (
    <MountTransition delay={200} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-medium">Monthly Performance</h3>
        </div>
        
        <div className="h-64 w-full">
          {typeof window !== 'undefined' && (
            <Chart 
              options={chartData.chartOptions as ApexCharts.ApexOptions}
              series={chartData.series}
              type="bar"
              height="100%"
            />
          )}
        </div>
      </div>
    </MountTransition>
  );
};
