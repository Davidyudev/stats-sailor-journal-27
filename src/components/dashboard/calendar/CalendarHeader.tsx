
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface CalendarHeaderProps {
  currentMonth: Date;
  prevMonth: () => void;
  nextMonth: () => void;
  isLoading: boolean;
}

export const CalendarHeader = ({ 
  currentMonth, 
  prevMonth, 
  nextMonth, 
  isLoading 
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Button 
        variant="ghost" 
        onClick={prevMonth} 
        size="icon"
        className="rounded-full"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h2 className="text-lg font-medium flex items-center gap-2">
        {format(currentMonth, 'MMMM yyyy')}
        {isLoading && <span className="text-xs text-muted-foreground">(Loading events...)</span>}
      </h2>
      <Button 
        variant="ghost" 
        onClick={nextMonth} 
        size="icon"
        className="rounded-full"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};
