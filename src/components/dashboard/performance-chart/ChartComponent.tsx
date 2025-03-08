
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
  
  // Add padding to the axis ranges for better visualization
  const leftPadding = Math.abs(leftMax - leftMin) * 0.2;
  const rightPadding = rightMax * 0.2;
  
  // Calculate a scale factor to align the zero points
  // We need to determine what percentage of the left axis range is below zero
  const leftRange = (leftMax + leftPadding) - (leftMin - leftPadding);
  const leftZeroPosition = leftMin < 0 ? Math.abs(leftMin - leftPadding) / leftRange : 0;
  
  // Apply the same zero position to the right axis
  const rightRange = (rightMax + rightPadding) - rightMin;
  const rightAxisMin = Math.min(0, rightMin - (leftZeroPosition * rightRange));
  
  // Ensure left axis always includes zero by adjusting domain
  const adjustedLeftMin = Math.min(0, leftMin - leftPadding);
  const adjustedLeftMax = Math.max(leftMax + leftPadding, leftPadding); // Ensure positive space if all values are 0
  
  // Ensure right axis always includes zero
  const adjustedRightMin = Math.min(0, rightAxisMin);
  const adjustedRightMax = rightMax + rightPadding;
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 30, right: 30, left: 5, bottom: 20 }}
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
            domain={[adjustedRightMin, adjustedRightMax]}
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
          <ReferenceLine y={0} yAxisId="right" stroke="#0EA5E9" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} />
          
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
