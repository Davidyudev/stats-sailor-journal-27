
import React, { useState } from 'react';
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
import { RefreshCw, AlertCircle, Settings, Database } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataSource } from '@/lib/services/economicCalendarService';

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
  // Settings dialog state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [fredApiKey, setFredApiKey] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource>('fred');
  
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
    isMockData,
    dataSource,
    changeDataSource,
    setFredApiKey: applyFredApiKey
  } = useEconomicEvents(currentMonth);
  
  const {
    isDetailsOpen,
    setIsDetailsOpen,
    selectedDayEvents,
    selectedDayPerformance,
    selectedDayHoliday,
    handleDateClick
  } = useCalendarDetails(filteredEvents, data, holidays);
  
  // Update local state when the data source changes
  React.useEffect(() => {
    setSelectedDataSource(dataSource);
  }, [dataSource]);
  
  // Handle date click
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    handleDateClick(day);
  };
  
  // Handle API settings save
  const handleSaveSettings = () => {
    if (selectedDataSource === 'fred' && fredApiKey.trim() !== '') {
      applyFredApiKey(fredApiKey);
    } else if (selectedDataSource !== dataSource) {
      changeDataSource(selectedDataSource);
    }
    setIsSettingsOpen(false);
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
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Data Source
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
                {dataSource === 'fred' && (
                  <div className="flex items-center text-xs">
                    <Database className="h-3 w-3 mr-1 text-primary" />
                    <span>FRED Economic Data</span>
                  </div>
                )}
                {dataSource === 'forexfactory' && (
                  <div className="flex items-center text-xs">
                    <Database className="h-3 w-3 mr-1 text-primary" />
                    <span>ForexFactory Data</span>
                  </div>
                )}
                {isMockData && (
                  <div className="flex items-center text-xs text-warning">
                    <AlertCircle className="h-3 w-3 mr-1" />
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
          
          {/* Data quality information */}
          {isMockData && (
            <div className="mt-4 text-sm p-2 border-2 border-dashed border-warning rounded-md bg-warning/10">
              <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-warning" />
                <span>
                  The economic calendar is currently showing simulated data. This can happen due to:
                </span>
              </p>
              <ul className="list-disc ml-8 mt-1 text-xs text-muted-foreground">
                <li>API connectivity issues</li>
                <li>Missing or invalid API key</li>
                <li>Temporary network problems</li>
              </ul>
              <p className="text-xs mt-2">
                Try clicking the Refresh button to fetch the most up-to-date data,
                or configure your data source in the Settings.
              </p>
            </div>
          )}
          
          {dataSource === 'fred' && (
            <div className="mt-4 text-sm p-2 border rounded-md bg-muted/20">
              <p className="flex items-center text-sm font-medium">
                <Database className="h-4 w-4 mr-2 text-primary" />
                <span>FRED Economic Data (Federal Reserve Bank of St. Louis)</span>
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                This calendar shows economic data releases from the Federal Reserve Economic Data (FRED) service.
                {!fredApiKey.trim() && <span className="text-warning"> For best results, configure your FRED API key in settings.</span>}
              </p>
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
      
      {/* Data Source Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Economic Calendar Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Data Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectedDataSource === 'fred' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('fred')}
                  className="flex-1"
                >
                  FRED Economic Data
                </Button>
                <Button
                  type="button"
                  variant={selectedDataSource === 'forexfactory' ? 'default' : 'outline'}
                  onClick={() => setSelectedDataSource('forexfactory')}
                  className="flex-1"
                >
                  ForexFactory
                </Button>
              </div>
            </div>
            
            {selectedDataSource === 'fred' && (
              <div className="space-y-2">
                <Label htmlFor="fred-api-key">FRED API Key</Label>
                <Input 
                  id="fred-api-key"
                  value={fredApiKey}
                  onChange={(e) => setFredApiKey(e.target.value)}
                  placeholder="Enter your FRED API key" 
                />
                <p className="text-xs text-muted-foreground">
                  Get a free API key from <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FRED API Key Registration</a>
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster position="bottom-right" />
    </>
  );
};
