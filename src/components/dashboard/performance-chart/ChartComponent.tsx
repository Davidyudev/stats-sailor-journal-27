
import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { CustomTooltip } from './CustomTooltip';

interface ChartComponentProps {
  data: any[];
}

export const ChartComponent = ({ data }: ChartComponentProps) => {
  // Calculate domains for both axes to align zero
  const { leftDomain, rightDomain } = useMemo(() => {
    // Find min and max values for both axes
    let minProfit = 0;
    let maxProfit = 0;
    let minAccumulated = 0;
    let maxAccumulated = 0;
    
    data.forEach(item => {
      if (item.profit < minProfit) minProfit = item.profit;
      if (item.profit > maxProfit) maxProfit = item.profit;
      if (item.accumulatedProfit < minAccumulated) minAccumulated = item.accumulatedProfit;
      if (item.accumulatedProfit > maxAccumulated) maxAccumulated = item.accumulatedProfit;
    });
    
    // Add some padding to make the chart look better
    const leftPadding = Math.max(Math.abs(minProfit), Math.abs(maxProfit)) * 0.1;
    const rightPadding = Math.max(Math.abs(minAccumulated), Math.abs(maxAccumulated)) * 0.1;
    
    // Create domains with padding
    const leftDomain = [minProfit - leftPadding, maxProfit + leftPadding];
    const rightDomain = [minAccumulated - rightPadding, maxAccumulated + rightPadding];
    
    return { leftDomain, rightDomain };
  }, [data]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
            tickLine={false}
            stroke="hsl(var(--chart-grid))"
          />
          <YAxis 
            yAxisId="left"
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
            tickLine={false}
            stroke="hsl(var(--chart-grid))"
            tickFormatter={(value) => `${value}`}
            domain={leftDomain}
            label={{ 
              value: 'Daily P/L', 
              angle: -90, 
              position: 'insideLeft', 
              style: { 
                textAnchor: 'middle', 
                fill: 'hsl(var(--foreground))',
                fontWeight: 500
              }, 
              offset: 0 
            }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: "#0EA5E9" }} 
            tickLine={false}
            stroke="#0EA5E9"
            tickFormatter={(value) => `${value}`}
            domain={rightDomain}
            label={{ 
              value: 'Accumulated', 
              angle: 90, 
              position: 'insideRight', 
              style: { 
                textAnchor: 'middle', 
                fill: '#0EA5E9',
                fontWeight: 500
              }, 
              offset: 0 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--neutral))" />
          <ReferenceLine y={0} yAxisId="right" stroke="#0EA5E9" strokeOpacity={0.3} />
          <Bar 
            yAxisId="left"
            dataKey="profit" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            name="Daily P/L"
            isAnimationActive={true}
            animationDuration={1500}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="accumulatedProfit" 
            stroke="#0EA5E9" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name="Accumulated P/L"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
