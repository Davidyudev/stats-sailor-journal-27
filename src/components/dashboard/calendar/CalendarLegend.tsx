
import React from 'react';
import { Info } from 'lucide-react';

export const CalendarLegend = () => {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-xs">
      <div className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-profit"></span>
        <span>Profitable Day</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-2 h-2 rounded-full bg-loss"></span>
        <span>Loss Day</span>
      </div>
      <div className="flex items-center gap-1">
        <Info className="h-3 w-3 text-secondary" />
        <span>Holiday</span>
      </div>
    </div>
  );
};
