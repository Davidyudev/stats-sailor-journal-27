
import { useState } from 'react';
import { addMonths, subMonths } from 'date-fns';

export const useCalendarDates = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return {
    currentMonth,
    selectedDate,
    setSelectedDate,
    prevMonth,
    nextMonth,
    goToToday
  };
};
