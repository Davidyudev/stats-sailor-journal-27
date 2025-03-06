
import { useState, useEffect } from 'react';
import { Calendar, Clock, ExternalLink, Filter, Search, X } from 'lucide-react';
import { MountTransition } from '@/components/ui/mt4-connector';
import { DailyPerformance, EconomicEvent, Holiday } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { forexFactoryEventsCache } from '@/lib/services/forexFactoryEventsCache';
import { Input } from '@/components/ui/input';

interface PerformanceCalendarProps {
  data: DailyPerformance[];
  holidays?: Holiday[];
  className?: string;
}

export const PerformanceCalendar = ({ data, holidays = [], className }: PerformanceCalendarProps) => {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleMonth, setVisibleMonth] = useState(new Date().getMonth());
  const [visibleYear, setVisibleYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Filter states
  const [impactFilter, setImpactFilter] = useState<('high' | 'medium' | 'low')[]>(['high', 'medium', 'low']);
  const [currencyFilter, setCurrencyFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const economicEvents = await forexFactoryEventsCache.getEvents();
      setEvents(economicEvents);
      
      // Extract available currencies
      const currencies = Array.from(new Set(economicEvents.map(event => event.currency)));
      setAvailableCurrencies(currencies);
      
      // Default to all currencies
      setCurrencyFilter(currencies);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(visibleMonth, visibleYear);
    const firstDay = getFirstDayOfMonth(visibleMonth, visibleYear);
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border/40 bg-background/50"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(visibleYear, visibleMonth, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find performance data for this day
      const performance = data.find(d => {
        const perfDate = new Date(d.date);
        return perfDate.getDate() === day && 
               perfDate.getMonth() === visibleMonth && 
               perfDate.getFullYear() === visibleYear;
      });
      
      // Find events for this day
      const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const matchesDate = eventDate.getDate() === day && 
                        eventDate.getMonth() === visibleMonth && 
                        eventDate.getFullYear() === visibleYear;
        const matchesImpact = impactFilter.includes(event.impact);
        const matchesCurrency = currencyFilter.includes(event.currency);
        const matchesSearch = searchQuery === '' || 
                           event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.currency.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesDate && matchesImpact && matchesCurrency && matchesSearch;
      });
      
      // Find holiday for this day
      const holiday = holidays.find(h => {
        const holidayDate = new Date(h.date);
        return holidayDate.getDate() === day && 
               holidayDate.getMonth() === visibleMonth && 
               holidayDate.getFullYear() === visibleYear;
      });
      
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === visibleMonth && 
                     new Date().getFullYear() === visibleYear;
                     
      const isSelected = selectedDate && 
                        selectedDate.getDate() === day && 
                        selectedDate.getMonth() === visibleMonth && 
                        selectedDate.getFullYear() === visibleYear;
      
      days.push(
        <div 
          key={day} 
          className={cn(
            "h-24 border border-border/40 overflow-hidden flex flex-col transition-colors",
            isToday ? "bg-primary/5 border-primary/30" : "bg-background/50",
            isSelected ? "ring-2 ring-primary ring-inset" : "",
            "hover:bg-muted/50 cursor-pointer"
          )}
          onClick={() => setSelectedDate(date)}
        >
          <div className="flex justify-between items-start p-1">
            <span className={cn(
              "font-medium text-sm rounded-full w-6 h-6 flex items-center justify-center",
              isToday ? "bg-primary text-primary-foreground" : ""
            )}>
              {day}
            </span>
            
            {performance && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                performance.profitLoss > 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
              )}>
                {performance.profitLoss > 0 ? "+" : ""}{performance.profitLoss.toFixed(1)}
              </span>
            )}
          </div>
          
          {holiday && (
            <div className="text-xs px-1 py-0.5 mx-1 mt-0.5 bg-muted rounded-sm truncate font-medium">
              {holiday.name}
            </div>
          )}
          
          <div className="flex flex-col gap-0.5 p-1 overflow-hidden">
            {filteredEvents.slice(0, 3).map((event, i) => (
              <div 
                key={i} 
                className={cn(
                  "text-[0.65rem] px-1 py-0.5 rounded-sm flex items-center truncate",
                  event.impact === 'high' ? "bg-loss/10 text-loss" : 
                  event.impact === 'medium' ? "bg-yellow-500/10 text-yellow-500" : 
                  "bg-muted text-muted-foreground"
                )}
              >
                <span className="font-medium mr-1">{event.currency}</span>
                <span className="truncate">{event.name}</span>
              </div>
            ))}
            {filteredEvents.length > 3 && (
              <div className="text-[0.65rem] text-muted-foreground px-1">
                +{filteredEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const toggleImpactFilter = (impact: 'high' | 'medium' | 'low') => {
    setImpactFilter(prev => 
      prev.includes(impact) 
        ? prev.filter(i => i !== impact) 
        : [...prev, impact]
    );
  };

  const toggleCurrencyFilter = (currency: string) => {
    setCurrencyFilter(prev => 
      prev.includes(currency) 
        ? prev.filter(c => c !== currency) 
        : [...prev, currency]
    );
  };

  const toggleAllCurrencies = () => {
    if (currencyFilter.length === availableCurrencies.length) {
      setCurrencyFilter([]);
    } else {
      setCurrencyFilter([...availableCurrencies]);
    }
  };

  const changeMonth = (increment: number) => {
    let newMonth = visibleMonth + increment;
    let newYear = visibleYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setVisibleMonth(newMonth);
    setVisibleYear(newYear);
  };

  // Get details for the selected date
  const selectedDateEvents = selectedDate ? events.filter(event => {
    const eventDate = new Date(event.date);
    const matchesDate = eventDate.getDate() === selectedDate.getDate() && 
                    eventDate.getMonth() === selectedDate.getMonth() && 
                    eventDate.getFullYear() === selectedDate.getFullYear();
    const matchesImpact = impactFilter.includes(event.impact);
    const matchesCurrency = currencyFilter.includes(event.currency);
    const matchesSearch = searchQuery === '' || 
                       event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       event.currency.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDate && matchesImpact && matchesCurrency && matchesSearch;
  }) : [];

  // Sort by time
  const sortedEvents = [...selectedDateEvents].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <MountTransition delay={100} className={cn("glass-card rounded-lg p-4", className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
        <div className="flex items-center">
          <Button onClick={() => changeMonth(-1)} variant="ghost" size="sm" className="h-9 w-9 p-0">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          <h2 className="text-xl font-semibold px-2">
            {monthNames[visibleMonth]} {visibleYear}
          </h2>
          <Button onClick={() => changeMonth(1)} variant="ghost" size="sm" className="h-9 w-9 p-0">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative grow md:w-40">
            <Search size={14} className="absolute left-2 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-9 w-full"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </Button>
            )}
          </div>
          
          {/* Impact Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter size={14} className="mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Impact</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={impactFilter.includes('high')}
                onCheckedChange={() => toggleImpactFilter('high')}
              >
                <Badge variant="outline" className="bg-loss/10 text-loss mr-2">High</Badge>
                High Impact
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={impactFilter.includes('medium')}
                onCheckedChange={() => toggleImpactFilter('medium')}
              >
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 mr-2">Medium</Badge>
                Medium Impact
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={impactFilter.includes('low')}
                onCheckedChange={() => toggleImpactFilter('low')}
              >
                <Badge variant="outline" className="bg-muted text-muted-foreground mr-2">Low</Badge>
                Low Impact
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuLabel className="mt-2">Currency</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={currencyFilter.length === availableCurrencies.length && availableCurrencies.length > 0}
                onCheckedChange={toggleAllCurrencies}
              >
                All Currencies
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <div className="max-h-40 overflow-y-auto">
                {availableCurrencies.map(currency => (
                  <DropdownMenuCheckboxItem
                    key={currency}
                    checked={currencyFilter.includes(currency)}
                    onCheckedChange={() => toggleCurrencyFilter(currency)}
                  >
                    {currency}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="grid grid-cols-7 mb-1">
        <div className="text-center text-sm font-medium text-muted-foreground">Sun</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Mon</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Tue</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Wed</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Thu</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Fri</div>
        <div className="text-center text-sm font-medium text-muted-foreground">Sat</div>
      </div>
      
      <div className="grid grid-cols-7 gap-px">
        {renderCalendarDays()}
      </div>
      
      {selectedDate && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            <h3 className="text-base font-medium">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto p-1 h-7 w-7"
              onClick={() => setSelectedDate(null)}
            >
              <X size={14} />
            </Button>
          </div>
          
          {sortedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No economic events on this day.</p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {sortedEvents.map((event, index) => (
                <div key={index} className="flex items-start p-2 rounded-md bg-muted/50">
                  <div className="mr-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <Badge variant="outline" className={cn(
                        "mr-2",
                        event.impact === 'high' ? "bg-loss/10 text-loss" : 
                        event.impact === 'medium' ? "bg-yellow-500/10 text-yellow-500" : 
                        "bg-muted text-muted-foreground"
                      )}>
                        {event.impact}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {event.currency}
                      </Badge>
                      <div className="ml-auto text-xs text-muted-foreground">
                        {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <h4 className="text-sm font-medium mt-1">{event.name}</h4>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                      <div>
                        <span className="text-muted-foreground">Previous: </span>
                        <span>{event.previous}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Forecast: </span>
                        <span>{event.forecast}</span>
                      </div>
                      {event.actual && (
                        <div>
                          <span className="text-muted-foreground">Actual: </span>
                          <span className="font-medium">{event.actual}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </MountTransition>
  );
};
