
import { ReactNode, useMemo } from 'react';
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
  // Calculate the min and max values for both axes to determine their scales
  const { minProfit, maxProfit, maxAccumulated } = useMemo(() => {
    let minP = 0;
    let maxP = 0;
    let maxA = 0;

    data.forEach(item => {
      minP = Math.min(minP, item.profit);
      maxP = Math.max(maxP, item.profit);
      maxA = Math.max(maxA, item.accumulatedProfit);
    });

    return {
      minProfit: minP,
      maxProfit: maxP,
      maxAccumulated: maxA
    };
  }, [data]);

  // Calculate domains for both axes to ensure zero is at the same position
  const calculateAxisDomains = useMemo(() => {
    // Find the proportion of negative and positive space needed for left axis
    const totalLeftRange = Math.max(Math.abs(minProfit), Math.abs(maxProfit)) * 2;
    const leftNegativeProportion = Math.abs(minProfit) / totalLeftRange;
    const leftPositiveProportion = 1 - leftNegativeProportion;

    // Scale the right axis to have the same zero position
    const rightPositiveValue = maxAccumulated;
    const rightNegativeValue = (leftNegativeProportion / leftPositiveProportion) * rightPositiveValue;

    return {
      leftDomain: [minProfit < 0 ? minProfit * 1.1 : 0, maxProfit * 1.1],
      rightDomain: [rightNegativeValue * -1, rightPositiveValue * 1.1]
    };
  }, [minProfit, maxProfit, maxAccumulated]);

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
            domain={calculateAxisDomains.leftDomain}
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
            domain={calculateAxisDomains.rightDomain}
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
          <ReferenceLine y={0} yAxisId="right" stroke="hsl(var(--neutral))" strokeOpacity={0.3} strokeDasharray="3 3" />
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
