
import { ChartContainer } from './chart/ChartContainer';

interface ChartComponentProps {
  data: any[];
}

export const ChartComponent = ({ data }: ChartComponentProps) => {
  return <ChartContainer data={data} />;
};
