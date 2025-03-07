
import { useState } from 'react';
import { format } from 'date-fns';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { DailyPerformance } from '@/lib/types';

export const useCalendarDetails = (
  filteredEvents: ForexEvent[],
  data: DailyPerformance[],
  holidays?: {
    date: Date;
    name: string;
  }[]
) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<ForexEvent[]>([]);
  const [selectedDayPerformance, setSelectedDayPerformance] = useState<DailyPerformance | undefined>(undefined);
  const [selectedDayHoliday, setSelectedDayHoliday] = useState<(typeof holidays)[0] | undefined>(undefined);

  const handleDateClick = (day: Date) => {
    // Set the selected date to the clicked day (create a new Date object to avoid reference issues)
    const clickedDate = new Date(day);
    
    // Get events for this day - using the proper date string format
    const dateStr = format(clickedDate, 'yyyy-MM-dd');
    
    // Find events for this specific day by comparing date strings
    const eventsForDay = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return format(eventDate, 'yyyy-MM-dd') === dateStr;
    });
    
    // Find performance data for this specific day
    const performanceForDay = data.find(item => {
      const itemDate = new Date(item.date);
      return format(itemDate, 'yyyy-MM-dd') === dateStr;
    });
    
    // Find holiday info for this specific day
    const holidayForDay = holidays?.find(holiday => {
      const holidayDate = new Date(holiday.date);
      return format(holidayDate, 'yyyy-MM-dd') === dateStr;
    });
    
    // Set the selected day data
    setSelectedDayEvents(eventsForDay);
    setSelectedDayPerformance(performanceForDay);
    setSelectedDayHoliday(holidayForDay);
    
    // Open the details dialog
    setIsDetailsOpen(true);
  };

  return {
    isDetailsOpen,
    setIsDetailsOpen,
    selectedDayEvents,
    selectedDayPerformance,
    selectedDayHoliday,
    handleDateClick
  };
};
