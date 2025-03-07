
import React from 'react';

export const CalendarDays = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="grid grid-cols-7 mb-2">
      {days.map(day => (
        <div key={day} className="text-xs font-medium text-center py-1.5 text-muted-foreground">
          {day}
        </div>
      ))}
    </div>
  );
};
