
import React, { useState, useEffect } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { format, addMonths, subMonths, getMonth, getYear, isValid } from 'date-fns';
import { forexFactoryService, ForexEvent } from '@/lib/services/forexFactoryService';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarDays } from './calendar/CalendarDays';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarLegend } from './calendar/CalendarLegend';
import { CalendarFilters } from './calendar/CalendarFilters';
import { CalendarDayDetails } from './CalendarDayDetails';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [economicEvents, setEconomicEvents] = useState<ForexEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ForexEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Day details dialog state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<ForexEvent[]>([]);
  const [selectedDayPerformance, setSelectedDayPerformance] = useState<DailyPerformance | undefined>(undefined);
  const [selectedDayHoliday, setSelectedDayHoliday] = useState<(typeof holidays)[0] | undefined>(undefined);
  
  // Filters
  const [impactFilters, setImpactFilters] = useState({
    high: true,
    medium: true,
    low: true
  });
  
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEconomicEvents = async () => {
      setIsLoading(true);
      try {
        const events = await forexFactoryService.getEvents(
          getYear(currentMonth),
          getMonth(currentMonth)
        );
        setEconomicEvents(events);
        
        // Extract unique currencies
        const currencies = [...new Set(events.map(event => event.currency))];
        setAvailableCurrencies(currencies);
        
        // Initialize selected currencies
        const currencySelections: Record<string, boolean> = {};
        currencies.forEach(currency => {
          currencySelections[currency] = true;
        });
        setSelectedCurrencies(currencySelections);
        
      } catch (error) {
        console.error('Failed to fetch economic events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEconomicEvents();
  }, [currentMonth]);
  
  // Filter events based on selected filters
  useEffect(() => {
    if (!economicEvents.length) return;
    
    const filtered = economicEvents.filter(event => {
      // Filter by impact
      const impactMatches = impactFilters[event.impact];
      
      // Filter by currency
      const currencyMatches = selectedCurrencies[event.currency] || false;
      
      // Filter by currency search input
      const searchMatches = !currencyFilter || 
        event.currency.toLowerCase().includes(currencyFilter.toLowerCase()) ||
        event.name.toLowerCase().includes(currencyFilter.toLowerCase());
      
      return impactMatches && currencyMatches && searchMatches;
    });
    
    setFilteredEvents(filtered);
  }, [economicEvents, impactFilters, selectedCurrencies, currencyFilter]);

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const onDateClick = (day: Date) => {
    // Set the selected date to the clicked day (create a new Date object to avoid reference issues)
    const clickedDate = new Date(day);
    setSelectedDate(clickedDate);
    
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
    const holidayForDay = holidays.find(holiday => {
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
  
  const handleToggleImpact = (impact: 'high' | 'medium' | 'low') => {
    setImpactFilters(prev => ({
      ...prev,
      [impact]: !prev[impact]
    }));
  };
  
  const handleToggleCurrency = (currency: string) => {
    setSelectedCurrencies(prev => ({
      ...prev,
      [currency]: !prev[currency]
    }));
  };
  
  const handleSelectAllCurrencies = (selected: boolean) => {
    const updatedSelections: Record<string, boolean> = {};
    availableCurrencies.forEach(currency => {
      updatedSelections[currency] = selected;
    });
    setSelectedCurrencies(updatedSelections);
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
