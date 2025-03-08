
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
  
  // Add padding to the axis ranges for better visualization
  const leftPadding = Math.abs(leftMax - leftMin) * 0.25; // Increased padding
  const rightPadding = Math.max(...data.map(item => item.accumulatedProfit)) * 0.25; // Increased padding
  
  // Ensure left axis always includes zero by adjusting domain
  const adjustedLeftMin = Math.min(-1, leftMin - leftPadding); // Always show below zero
  const adjustedLeftMax = Math.max(1, leftMax + leftPadding); // Always show above zero
  
  // Ensure right axis always includes zero and has appropriate padding
  const adjustedRightMin = Math.min(-1, -rightPadding); // Always show below zero
  const adjustedRightMax = Math.max(...data.map(item => item.accumulatedProfit)) + rightPadding;
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 40, right: 40, left: 10, bottom: 30 }} // Increased margins
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
          
          {/* More prominent reference lines at zero */}
          <ReferenceLine 
            y={0} 
            yAxisId="left" 
            stroke="hsl(var(--neutral))" 
            strokeWidth={2} 
            label={{
              value: '0',
              position: 'insideBottomLeft',
              fill: 'hsl(var(--foreground))',
              fontSize: 12
            }}
          />
          
          <ReferenceLine 
            y={0} 
            yAxisId="right" 
            stroke="#0EA5E9" 
            strokeWidth={1.5} 
            strokeDasharray="3 3" 
            label={{
              value: '0',
              position: 'insideBottomRight',
              fill: '#0EA5E9',
              fontSize: 12
            }}
          />
          
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
