
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
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
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
    filteredEvents,
    isLoading,
    lastRefreshed,
    refreshEvents,
    impactFilters,
    currencyFilter,
    setCurrencyFilter,
    availableCurrencies,
    selectedCurrencies,
    handleToggleImpact,
    handleToggleCurrency,
    handleSelectAllCurrencies,
    isMockData
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
    <>
      <MountTransition delay={300} className={cn("glass-card rounded-lg", className)}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium">Trading Calendar</h3>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshEvents} 
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
                  Refresh
                </Button>
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
              <div className="flex items-center gap-2">
                {isMockData && (
                  <div className="flex items-center text-xs text-warning">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Using simulated data - click Refresh to try again</span>
                  </div>
                )}
                {lastRefreshed && (
                  <span className="text-xs text-muted-foreground">
                    Last updated: {format(lastRefreshed, 'MMM d, yyyy h:mm a')}
                  </span>
                )}
              </div>
            </div>
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
          
          {/* Data source info */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Economic calendar data source: Investing.com</span>
            
            {isMockData && (
              <div className="flex items-center text-warning">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                <span>Calendar showing simulated data due to connection issues</span>
              </div>
            )}
          </div>
          
          {/* Data quality information */}
          {isMockData && (
            <div className="mt-2 text-sm p-2 border-2 border-dashed border-warning rounded-md bg-warning/10">
              <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-warning" />
                <span>
                  The economic calendar is currently showing simulated data. This can happen due to:
                </span>
              </p>
              <ul className="list-disc ml-8 mt-1 text-xs text-muted-foreground">
                <li>CORS restrictions blocking access to Investing.com</li>
                <li>Changes to the Investing.com website format</li>
                <li>Temporary network problems</li>
              </ul>
              <p className="text-xs mt-2">Try clicking the Refresh button to fetch the most up-to-date data.</p>
            </div>
          )}
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
      <Toaster position="bottom-right" />
    </>
  );
};
