
import { ReactNode } from 'react';
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
  // Find min/max values for proper scaling
  const profits = data.map(item => item.profit);
  const maxProfit = Math.max(...profits, 0);
  const minProfit = Math.min(...profits, 0);
  
  const accumulated = data.map(item => item.accumulatedProfit);
  const maxAccumulated = Math.max(...accumulated, 0);
  const minAccumulated = Math.min(...accumulated, 0);
  
  // Calculate domain padding to ensure zero is properly positioned
  const leftDomainPadding = Math.abs(minProfit) > 0 ? 0.1 : 0;
  const rightDomainPadding = Math.abs(minAccumulated) > 0 ? 0.1 : 0;
  
  // Calculate domains to align the zero point
  const leftDomain = [
    minProfit < 0 ? minProfit * (1 + leftDomainPadding) : 0, 
    maxProfit * 1.1
  ];
  
  const rightDomain = [
    minAccumulated < 0 ? minAccumulated * (1 + rightDomainPadding) : 0, 
    maxAccumulated * 1.1
  ];

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
          <ReferenceLine y={0} yAxisId="right" stroke="hsl(var(--neutral))" strokeOpacity={0.5} strokeDasharray="3 3" />
          <Bar 
            yAxisId="left"
            dataKey="profit" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            name="Daily P/L"
            isAnimationActive={true}
            animationDuration={1500}
            minPointSize={3}
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
