
import React from 'react';
import { cn } from '@/lib/utils';
import { ForexEvent } from '@/lib/services/investingService';

interface EventItemProps {
  event: ForexEvent;
}

export const EventItem = ({ event }: EventItemProps) => {
  return (
    <div className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className={cn(
            "inline-block w-2 h-2 rounded-full",
            event.impact === 'high' ? "bg-destructive" : 
            event.impact === 'medium' ? "bg-warning" : "bg-muted-foreground"
          )} />
          <span className="font-medium">{event.currency}</span>
        </div>
        <span className="text-xs text-muted-foreground">{event.time}</span>
      </div>
      <div className="text-sm mt-1">{event.name}</div>
      
      {(event.actual || event.forecast || event.previous) && (
        <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
          {event.actual && (
            <div>
              <span className="text-muted-foreground">Actual: </span>
              <span className="font-medium">{event.actual}</span>
            </div>
          )}
          {event.forecast && (
            <div>
              <span className="text-muted-foreground">Forecast: </span>
              <span className="font-medium">{event.forecast}</span>
            </div>
          )}
          {event.previous && (
            <div>
              <span className="text-muted-foreground">Previous: </span>
              <span className="font-medium">{event.previous}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
