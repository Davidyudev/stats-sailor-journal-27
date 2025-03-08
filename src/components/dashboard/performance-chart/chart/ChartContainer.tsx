
import { useRef } from 'react';
import { ChartRenderer } from './ChartRenderer';

interface ChartContainerProps {
  data: any[];
}

export const ChartContainer = ({ data }: ChartContainerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  return (
    <div className="h-64 w-full">
      <svg ref={svgRef} width="100%" height="100%" />
      <ChartRenderer svgRef={svgRef} data={data} />
    </div>
  );
};
