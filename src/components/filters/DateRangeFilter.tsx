
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type TimePeriod = 'all' | '1m' | '3m' | '6m' | '1y' | 'custom';

interface DateRangeFilterProps {
  selectedPeriod: TimePeriod;
  setSelectedPeriod: (period: TimePeriod) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  setSelectedPeriod,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  className,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handlePeriodChange = (value: string) => {
    const period = value as TimePeriod;
    setSelectedPeriod(period);
    
    if (period !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
    } else {
      setCalendarOpen(true);
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="1m">Last Month</SelectItem>
          <SelectItem value="3m">Last 3 Months</SelectItem>
          <SelectItem value="6m">Last 6 Months</SelectItem>
          <SelectItem value="1y">Last Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {selectedPeriod === 'custom' && (
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal h-9",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate && endDate ? (
                `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: startDate,
                to: endDate,
              }}
              onSelect={(range) => {
                setStartDate(range?.from);
                setEndDate(range?.to);
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DateRangeFilter;
