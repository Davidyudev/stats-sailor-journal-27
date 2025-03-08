
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
  // Calculate the min and max values for each axis to determine scaling
  const leftMin = Math.min(...data.map(item => item.profit));
  const leftMax = Math.max(...data.map(item => item.profit));
  const rightMin = 0; // Always start at 0 for accumulated
  const rightMax = Math.max(...data.map(item => item.accumulatedProfit));
  
  // Calculate a scale factor to align the zero points
  // We need to determine what percentage of the left axis range is below zero
  const leftRange = leftMax - leftMin;
  const leftZeroPosition = leftMin < 0 ? Math.abs(leftMin) / leftRange : 0;
  
  // Apply the same zero position to the right axis
  const rightRange = rightMax - rightMin;
  const rightAxisMin = rightMin - (leftZeroPosition * rightRange);
  
  // Ensure left axis always includes zero by adjusting domain if needed
  const adjustedLeftMin = Math.min(0, leftMin);
  const adjustedLeftMax = Math.max(0, leftMax);
  
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
            tickFormatter={(value) => Number(value).toFixed(2)}
            domain={[adjustedLeftMin, adjustedLeftMax]}
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
            tickFormatter={(value) => Number(value).toFixed(2)}
            domain={[rightAxisMin, rightMax]}
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
          <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--neutral))" strokeWidth={2} />
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
