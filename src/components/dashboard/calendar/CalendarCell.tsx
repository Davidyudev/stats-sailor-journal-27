
import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { ForexEvent } from '@/lib/services/investingService';

interface CalendarCellProps {
  day: Date;
  monthStart: Date;
  selectedDate: Date | null;
  onDateClick: (day: Date) => void;
  performance?: DailyPerformance;
  events: ForexEvent[];
  holiday?: {
    date: Date;
    name: string;
  };
}

export const CalendarCell = ({ 
  day, 
  monthStart, 
  selectedDate, 
  onDateClick, 
  performance, 
  events,
  holiday 
}: CalendarCellProps) => {
  return (
    <div
      className={cn(
        "h-28 p-2 border border-border/40 text-sm cursor-pointer hover:bg-muted/30 transition-colors flex flex-col",
        !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/20",
        selectedDate && isSameDay(day, selectedDate) && "bg-primary/10 border-primary/50",
        holiday && "bg-accent/30",
        performance && performance.profitLoss > 0 && "bg-profit/5",
        performance && performance.profitLoss < 0 && "bg-loss/5"
      )}
      onClick={() => onDateClick(new Date(day))}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          "inline-flex items-center justify-center w-7 h-7 text-center leading-6 text-xs rounded-full font-medium",
          isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
        )}>
          {format(day, 'd')}
        </span>
        
        <div className="flex items-center gap-1">          
          {holiday && (
            <Info className="h-3.5 w-3.5 text-secondary" />
          )}
        </div>
      </div>
      
      {performance && (
        <div className={cn(
          "text-xs font-medium",
          performance.profitLoss >= 0 ? "text-profit" : "text-loss"
        )}>
          {performance.profitLoss >= 0 ? "+" : ""}{performance.profitLoss.toFixed(2)}
        </div>
      )}
      
      {performance && performance.trades > 0 && (
        <div className="text-xs mt-0.5 text-muted-foreground">
          Trades: {performance.trades}
        </div>
      )}
      
      <div className="mt-auto">
        {holiday && (
          <div className="text-[10px] text-secondary truncate font-medium" title={holiday.name}>
            {holiday.name}
          </div>
        )}
      </div>
    </div>
  );
};
