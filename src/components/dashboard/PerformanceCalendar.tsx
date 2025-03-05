
import React, { useState, useEffect } from 'react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { cn } from '@/lib/utils';
import { DailyPerformance } from '@/lib/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths, addDays, isSameMonth, isSameDay, getMonth, getYear } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { forexFactoryService, ForexEvent } from '@/lib/services/forexFactoryService';

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [economicEvents, setEconomicEvents] = useState<ForexEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEconomicEvents = async () => {
      setIsLoading(true);
      try {
        const events = await forexFactoryService.getEvents(
          getYear(currentMonth),
          getMonth(currentMonth)
        );
        setEconomicEvents(events);
      } catch (error) {
        console.error('Failed to fetch economic events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEconomicEvents();
  }, [currentMonth]);

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          onClick={prevMonth} 
          size="icon"
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium flex items-center gap-2">
          {format(currentMonth, 'MMMM yyyy')}
          {isLoading && <span className="text-xs text-muted-foreground">(Loading events...)</span>}
        </h2>
        <Button 
          variant="ghost" 
          onClick={nextMonth} 
          size="icon"
          className="rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map(day => (
          <div key={day} className="text-xs font-medium text-center py-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    // Create performance lookup for fast access
    const performanceLookup = data.reduce((acc, item) => {
      const dateStr = format(item.date, 'yyyy-MM-dd');
      acc[dateStr] = item;
      return acc;
    }, {} as Record<string, DailyPerformance>);

    // Create economic events lookup
    const eventsLookup = economicEvents.reduce((acc, event) => {
      const dateStr = format(event.date, 'yyyy-MM-dd');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(event);
      return acc;
    }, {} as Record<string, ForexEvent[]>);

    // Create holidays lookup
    const holidaysLookup = holidays.reduce((acc, holiday) => {
      const dateStr = format(holiday.date, 'yyyy-MM-dd');
      acc[dateStr] = holiday;
      return acc;
    }, {} as Record<string, (typeof holidays)[0]>);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayPerformance = performanceLookup[dateStr];
        const dayEvents = eventsLookup[dateStr] || [];
        const holiday = holidaysLookup[dateStr];
        
        const hasHighImpactEvent = dayEvents.some(e => e.impact === 'high');
        
        days.push(
          <div
            className={cn(
              "min-h-[80px] p-1 border border-border/40 text-sm",
              !isSameMonth(day, monthStart) && "text-muted-foreground bg-muted/20",
              isSameDay(day, selectedDate) && "bg-primary/10 border-primary/50",
              holiday && "bg-muted/30"
            )}
            key={day.toString()}
            onClick={() => onDateClick(day)}
          >
            <div className="flex justify-between items-start">
              <span className={cn(
                "inline-block w-6 h-6 text-center leading-6 text-xs rounded-full",
                isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
              )}>
                {format(day, 'd')}
              </span>
              
              {hasHighImpactEvent && (
                <AlertTriangle className="h-3 w-3 text-destructive" />
              )}
              
              {holiday && (
                <Info className="h-3 w-3 text-secondary" />
              )}
            </div>
            
            {dayPerformance && (
              <div className={cn(
                "text-xs mt-1 font-medium",
                dayPerformance.profitLoss >= 0 ? "text-profit" : "text-loss"
              )}>
                {dayPerformance.profitLoss >= 0 ? "+" : ""}{dayPerformance.profitLoss.toFixed(2)}
              </div>
            )}
            
            {dayPerformance && (
              <div className="text-xs mt-1">
                Trades: {dayPerformance.trades}
              </div>
            )}
            
            {dayEvents.length > 0 && (
              <div className="mt-1">
                {dayEvents
                  .sort((a, b) => {
                    // Sort by impact first (high -> medium -> low)
                    const impactOrder = { high: 0, medium: 1, low: 2 };
                    return impactOrder[a.impact] - impactOrder[b.impact];
                  })
                  .slice(0, 2) // Only show the top 2 events to avoid cluttering
                  .map((event, idx) => (
                    <div 
                      key={idx} 
                      className="text-[10px] truncate flex items-center gap-1" 
                      title={`${event.currency} ${event.name} at ${event.time}`}
                    >
                      <span className={cn(
                        "inline-block w-1 h-1 rounded-full",
                        event.impact === 'high' ? "bg-destructive" : 
                        event.impact === 'medium' ? "bg-warning" : "bg-muted-foreground"
                      )} />
                      <span className="font-medium">{event.currency}</span>
                      {event.name.substring(event.currency.length + 1).substring(0, 10)}...
                    </div>
                  ))}
                {dayEvents.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 2} more events
                  </div>
                )}
              </div>
            )}
            
            {holiday && (
              <div className="text-[10px] mt-1 text-secondary truncate" title={holiday.name}>
                {holiday.name}
              </div>
            )}
          </div>
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

  return (
    <MountTransition delay={300} className={cn("glass-card rounded-lg", className)}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Trading Calendar</h3>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => setCurrentMonth(new Date())}
          >
            TODAY
          </Button>
        </div>
        
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        
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
      </div>
    </MountTransition>
  );
};
