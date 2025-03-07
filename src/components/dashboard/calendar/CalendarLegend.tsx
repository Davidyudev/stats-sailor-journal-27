
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const CalendarLegend = () => {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-xs">
      <div className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3 text-destructive" />
        <span>High Impact News</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-warning"></span>
        <span>Medium Impact</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground"></span>
        <span>Low Impact</span>
      </div>
      <div className="flex items-center gap-1">
        <Info className="h-3 w-3 text-secondary" />
        <span>Holiday</span>
      </div>
    </div>
  );
};
