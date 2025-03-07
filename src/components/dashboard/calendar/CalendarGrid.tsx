
import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { DailyPerformance } from '@/lib/types';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { CalendarCell } from './CalendarCell';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDate: Date | null;
  onDateClick: (day: Date) => void;
  data: DailyPerformance[];
  filteredEvents: ForexEvent[];
  holidays?: {
    date: Date;
    name: string;
  }[];
}

export const CalendarGrid = ({
  currentMonth,
  selectedDate,
  onDateClick,
  data,
  filteredEvents,
  holidays = []
}: CalendarGridProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Create performance lookup for fast access
  const performanceLookup = data.reduce((acc, item) => {
    const dateStr = format(new Date(item.date), 'yyyy-MM-dd');
    acc[dateStr] = item;
    return acc;
  }, {} as Record<string, DailyPerformance>);

  // Create economic events lookup
  const eventsLookup = filteredEvents.reduce((acc, event) => {
    const dateStr = format(new Date(event.date), 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, ForexEvent[]>);

  // Create holidays lookup
  const holidaysLookup = holidays.reduce((acc, holiday) => {
    const dateStr = format(new Date(holiday.date), 'yyyy-MM-dd');
    acc[dateStr] = holiday;
    return acc;
  }, {} as Record<string, (typeof holidays)[0]>);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const dayPerformance = performanceLookup[formattedDate];
      const dayEvents = eventsLookup[formattedDate] || [];
      const holiday = holidaysLookup[formattedDate];
      
      days.push(
        <CalendarCell
          key={day.toString()}
          day={new Date(day)}
          monthStart={monthStart}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          performance={dayPerformance}
          events={dayEvents}
          holiday={holiday}
        />
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }
  
  return <div className="space-y-1">{rows}</div>;
};
