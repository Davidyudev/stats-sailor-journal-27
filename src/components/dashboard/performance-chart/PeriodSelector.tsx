
import { TimePeriod } from '@/hooks/useTimePeriodFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PeriodSelectorProps {
  selectedTimePeriod: TimePeriod;
  setSelectedTimePeriod: (value: TimePeriod) => void;
}

export const PeriodSelector = ({ 
  selectedTimePeriod, 
  setSelectedTimePeriod 
}: PeriodSelectorProps) => {
  return (
    <Select 
      value={selectedTimePeriod} 
      onValueChange={(value) => setSelectedTimePeriod(value as TimePeriod)}
    >
      <SelectTrigger className="w-[120px] h-8 text-xs">
        <SelectValue placeholder="Time Period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="this-week">This Week</SelectItem>
        <SelectItem value="this-month">This Month</SelectItem>
        <SelectItem value="1m">1 Month</SelectItem>
        <SelectItem value="3m">3 Months</SelectItem>
        <SelectItem value="6m">6 Months</SelectItem>
        <SelectItem value="1y">1 Year</SelectItem>
        <SelectItem value="all">Overall</SelectItem>
      </SelectContent>
    </Select>
  );
};
