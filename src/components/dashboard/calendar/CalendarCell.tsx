
import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { ForexEvent } from '@/lib/services/forexFactoryService';

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
  const hasHighImpactEvent = events.some(e => e.impact === 'high');

  return (
    <div
      className={cn(
        "min-h-[80px] p-1 border border-border/40 text-sm cursor-pointer hover:bg-muted/30 transition-colors",
        !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/20",
        selectedDate && isSameDay(day, selectedDate) && "bg-primary/10 border-primary/50",
        holiday && "bg-muted/30"
      )}
      onClick={() => onDateClick(new Date(day))}
    >
      <div className="flex justify-between items-start">
        <span className={cn(
          "inline-block w-6 h-6 text-center leading-6 text-xs rounded-full",
          isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
        )}>
          {format(day, 'd')}
        </span>
        
        {hasHighImpactEvent && (
          <AlertTriangle className="h-3 w-3 text-destructive" />
        )}
        
        {holiday && (
          <Info className="h-3 w-3 text-secondary" />
        )}
      </div>
      
      {performance && (
        <div className={cn(
          "text-xs mt-1 font-medium",
          performance.profitLoss >= 0 ? "text-profit" : "text-loss"
        )}>
          {performance.profitLoss >= 0 ? "+" : ""}{performance.profitLoss.toFixed(2)}
        </div>
      )}
      
      {performance && (
        <div className="text-xs mt-1">
          Trades: {performance.trades}
        </div>
      )}
      
      {events.length > 0 && (
        <div className="mt-1">
          {events
            .sort((a, b) => {
              // Sort by impact first (high -> medium -> low)
              const impactOrder = { high: 0, medium: 1, low: 2 };
              return impactOrder[a.impact] - impactOrder[b.impact];
            })
            .slice(0, 2) // Only show the top 2 events to avoid cluttering
            .map((event, idx) => (
              <div 
                key={idx} 
                className="text-[10px] truncate flex items-center gap-1" 
                title={`${event.currency} ${event.name} at ${event.time}`}
              >
                <span className={cn(
                  "inline-block w-1 h-1 rounded-full",
                  event.impact === 'high' ? "bg-destructive" : 
                  event.impact === 'medium' ? "bg-warning" : "bg-muted-foreground"
                )} />
                <span className="font-medium">{event.currency}</span>
                {event.name.substring(event.currency.length + 1).substring(0, 10)}...
              </div>
            ))}
          {events.length > 2 && (
            <div className="text-[10px] text-muted-foreground">
              +{events.length - 2} more events
            </div>
          )}
        </div>
      )}
      
      {holiday && (
        <div className="text-[10px] mt-1 text-secondary truncate" title={holiday.name}>
          {holiday.name}
        </div>
      )}
    </div>
  );
};
