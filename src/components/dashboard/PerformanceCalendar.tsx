
import React from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarDays } from './calendar/CalendarDays';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarLegend } from './calendar/CalendarLegend';
import { CalendarDayDetails } from './CalendarDayDetails';
import { useCalendarDates } from '@/hooks/useCalendarDates';
import { useCalendarDetails } from '@/hooks/useCalendarDetails';
import { Toaster } from 'sonner';

interface PerformanceCalendarProps {
  data: DailyPerformance[];
  className?: string;
  holidays?: {
    date: Date;
    name: string;
  }[];
}

export const PerformanceCalendar = ({ 
  data, 
  className,
  holidays = []
}: PerformanceCalendarProps) => {
  // Use custom hooks
  const { 
    currentMonth, 
    selectedDate, 
    setSelectedDate, 
    prevMonth, 
    nextMonth, 
    goToToday 
  } = useCalendarDates();
  
  const {
    isDetailsOpen,
    setIsDetailsOpen,
    selectedDayEvents,
    selectedDayPerformance,
    selectedDayHoliday,
    handleDateClick
  } = useCalendarDetails([], data, holidays); // Pass empty array for events
  
  // Handle date click
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    handleDateClick(day);
  };

  return (
    <>
      <MountTransition delay={300} className={cn("glass-card rounded-lg", className)}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Performance Calendar</h3>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <button 
                  className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80"
                  onClick={goToToday}
                >
                  Today
                </button>
              </div>
            </div>
          </div>
            
          <CalendarHeader 
            currentMonth={currentMonth} 
            prevMonth={prevMonth} 
            nextMonth={nextMonth} 
            isLoading={false} 
          />
          <CalendarDays />
          <CalendarGrid 
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDateClick={onDateClick}
            data={data}
            filteredEvents={[]}
            holidays={holidays}
          />
              
          <CalendarLegend />
        </div>
        
        {/* Only render the details dialog if there's a selected date */}
        {selectedDate && (
          <CalendarDayDetails
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            date={selectedDate}
            performance={selectedDayPerformance}
            events={[]}
            holiday={selectedDayHoliday}
          />
        )}
      </MountTransition>
      <Toaster position="bottom-right" />
    </>
  );
};
