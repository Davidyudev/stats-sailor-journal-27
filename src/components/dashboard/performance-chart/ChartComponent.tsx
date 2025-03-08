
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
  Legend,
  Area
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
  
  // Custom bar colors based on profit value
  const getBarColor = (entry: any) => {
    return entry.profit >= 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))';
  };
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorAccumulated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.7}/>
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" strokeOpacity={0.8} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }} 
            tickLine={false}
            stroke="hsl(var(--chart-grid))"
            tickMargin={10}
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
                fontWeight: 500,
                fontSize: 13
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
                fontWeight: 500,
                fontSize: 13
              }, 
              offset: 0 
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <ReferenceLine y={0} yAxisId="left" stroke="hsl(var(--neutral))" strokeWidth={2} strokeDasharray="3 3" />
          
          {/* Add subtle area under the accumulated line */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="accumulatedProfit"
            stroke="none"
            fill="url(#colorAccumulated)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          
          <Bar 
            yAxisId="left"
            dataKey="profit" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            name="Daily P/L"
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
            stroke="#00000020"
            strokeWidth={1}
            maxBarSize={40}
            fillOpacity={0.85}
            fill={(entry) => getBarColor(entry)}
          />
          
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="accumulatedProfit" 
            stroke="#0EA5E9" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "#FFFFFF" }}
            name="Accumulated P/L"
            animationDuration={1800}
            animationEasing="ease-in-out"
            strokeLinecap="round"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
