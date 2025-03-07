
import { useState, useCallback, useEffect } from 'react';
import { getMonth, getYear } from 'date-fns';
import { investingService, ForexEvent } from '@/lib/services/investingService';
import { toast } from "sonner";

export const useEventsFetching = (currentMonth: Date) => {
  const [economicEvents, setEconomicEvents] = useState<ForexEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Function to fetch economic events
  const fetchEconomicEvents = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      
      // Store the current real data status before fetching
      const wasMockData = isMockData;
      
      console.log(`Fetching economic events for ${year}-${month + 1}`);
      
      // Add a timeout to ensure the function doesn't hang
      const fetchPromise = investingService.getEvents(year, month);
      const timeoutPromise = new Promise<ForexEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch timeout')), 20000);
      });
      
      // Race between actual fetch and timeout
      const events = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log(`Received ${events.length} events`);
      
      // Check for data quality
      const hasHighImpact = events.some(e => e.impact === 'high');
      const hasMediumImpact = events.some(e => e.impact === 'medium');
      const hasEvents = events.length > 0;
      
      if (!hasEvents) {
        console.log("Data quality check failed - no events received");
        setIsMockData(true);
        setFetchError("No events could be retrieved");
      } else if (!hasHighImpact && !hasMediumImpact) {
        console.log("Data quality check failed - all low impact events");
        setIsMockData(true);
        setFetchError("Only low-impact events found, data may be incomplete");
      } else {
        setIsMockData(false);
        setFetchError(null);
        console.log("Using real data from Investing.com");
      }
      
      setEconomicEvents(events);
      setLastRefreshed(new Date());
      
      // If we were using mock data before and now we got real data, show success toast
      if (wasMockData && !isMockData) {
        toast.success('Successfully fetched real economic calendar data');
      }
      
    } catch (error) {
      console.error('Failed to fetch economic events:', error);
      setIsMockData(true);
      setFetchError("Connection error: " + (error instanceof Error ? error.message : "Unknown error"));
      toast.error('Failed to load economic calendar data. Using fallback data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, isMockData]);

  // Fetch economic events when the month changes
  useEffect(() => {
    fetchEconomicEvents();
  }, [currentMonth, fetchEconomicEvents]);
  
  // Manual refresh function
  const refreshEvents = async () => {
    toast.info('Refreshing economic calendar data...');
    setIsLoading(true);
    try {
      // Clear cache for current month to force refresh
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      
      // Store the current mock data status before refreshing
      const wasMockData = isMockData;
      
      // Clear cache and force refresh
      investingService.clearCache(year, month);
      
      // Force refresh by fetching again
      const fetchPromise = investingService.getEvents(year, month);
      const timeoutPromise = new Promise<ForexEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), 20000);
      });
      
      // Race between actual fetch and timeout
      const events = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Check for data quality issues
      const hasHighImpact = events.some(e => e.impact === 'high');
      const hasMediumImpact = events.some(e => e.impact === 'medium');
      
      if (events.length === 0) {
        console.log("Refresh data quality check failed - no events received");
        setIsMockData(true);
        setFetchError("No events found");
        toast.warning('No calendar data found. Using fallback data.');
      } else if (!hasHighImpact && !hasMediumImpact) {
        console.log("Refresh data quality check failed - no high/medium impact events");
        setIsMockData(true);
        setFetchError("Only low-impact events found, data may be incomplete");
        toast.warning('Calendar data may be incomplete. Using enhanced fallback data.');
      } else {
        setIsMockData(false);
        setFetchError(null);
      }
      
      setEconomicEvents(events);
      setLastRefreshed(new Date());
      
      // If we transitioned from mock to real data
      if (wasMockData && !isMockData) {
        toast.success('Successfully switched to real economic data');
      } else if (!wasMockData && !isMockData) {
        toast.success('Economic calendar data refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to refresh economic events:', error);
      setIsMockData(true);
      setFetchError("Refresh error: " + (error instanceof Error ? error.message : "Unknown error"));
      toast.error('Failed to refresh calendar data. Using fallback data.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    economicEvents,
    isLoading,
    lastRefreshed,
    refreshEvents,
    isMockData,
    fetchError
  };
};
