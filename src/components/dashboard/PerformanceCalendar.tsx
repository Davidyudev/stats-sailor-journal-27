
import React from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarDays } from './calendar/CalendarDays';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarLegend } from './calendar/CalendarLegend';
import { CalendarFilters } from './calendar/CalendarFilters';
import { CalendarDayDetails } from './CalendarDayDetails';
import { useCalendarDates } from '@/hooks/useCalendarDates';
import { useEconomicEvents } from '@/hooks/useEconomicEvents';
import { useCalendarDetails } from '@/hooks/useCalendarDetails';

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
    filteredEvents,
    isLoading,
    impactFilters,
    currencyFilter,
    setCurrencyFilter,
    availableCurrencies,
    selectedCurrencies,
    handleToggleImpact,
    handleToggleCurrency,
    handleSelectAllCurrencies
  } = useEconomicEvents(currentMonth);
  
  const {
    isDetailsOpen,
    setIsDetailsOpen,
    selectedDayEvents,
    selectedDayPerformance,
    selectedDayHoliday,
    handleDateClick
  } = useCalendarDetails(filteredEvents, data, holidays);
  
  // Handle date click
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    handleDateClick(day);
  };

  return (
    <MountTransition delay={300} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Trading Calendar</h3>
          <CalendarFilters 
            impactFilters={impactFilters}
            handleToggleImpact={handleToggleImpact}
            currencyFilter={currencyFilter}
            setCurrencyFilter={setCurrencyFilter}
            availableCurrencies={availableCurrencies}
            selectedCurrencies={selectedCurrencies}
            handleToggleCurrency={handleToggleCurrency}
            handleSelectAllCurrencies={handleSelectAllCurrencies}
            goToToday={goToToday}
          />
        </div>
        
        <CalendarHeader 
          currentMonth={currentMonth} 
          prevMonth={prevMonth} 
          nextMonth={nextMonth} 
          isLoading={isLoading} 
        />
        <CalendarDays />
        <CalendarGrid 
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          data={data}
          filteredEvents={filteredEvents}
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
          events={selectedDayEvents}
          holiday={selectedDayHoliday}
        />
      )}
    </MountTransition>
  );
};
