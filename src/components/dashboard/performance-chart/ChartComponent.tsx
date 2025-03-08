
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
  // Calculate the domains for both axes to ensure zero alignment
  const getYDomains = () => {
    // Find min and max values for left axis (daily profit/loss)
    const leftValues = data.map(item => item.profit);
    const leftMin = Math.min(0, ...leftValues);
    const leftMax = Math.max(0, ...leftValues);
    
    // Make the left domain symmetrical if needed to balance the chart
    const leftAbsMax = Math.max(Math.abs(leftMin), Math.abs(leftMax));
    const leftDomain = [-leftAbsMax, leftAbsMax];
    
    // Find max for right axis (accumulated profit)
    const rightValues = data.map(item => item.accumulatedProfit);
    const rightMin = Math.min(0, ...rightValues);
    const rightMax = Math.max(0, ...rightValues);
    
    // Calculate right domain to align with left domain at zero
    // The key is to maintain the same ratio of data units to pixels on both axes
    const rightRange = rightMax - rightMin;
    const leftRange = leftDomain[1] - leftDomain[0];
    
    // Calculate the position of zero within the left domain as a ratio
    const zeroPositionRatio = Math.abs(leftDomain[0]) / leftRange;
    
    // Calculate the right domain based on this ratio to align zeros
    const rightDomain = [
      -zeroPositionRatio * rightRange,
      (1 - zeroPositionRatio) * rightRange
    ];
    
    return { leftDomain, rightDomain };
  };
  
  const { leftDomain, rightDomain } = getYDomains();

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
