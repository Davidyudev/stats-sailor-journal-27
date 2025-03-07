
import { useState, useEffect, useCallback } from 'react';
import { getMonth, getYear } from 'date-fns';
import { forexFactoryService, ForexEvent } from '@/lib/services/forexFactoryService';
import { toast } from "sonner";

export const useEconomicEvents = (currentMonth: Date) => {
  const [economicEvents, setEconomicEvents] = useState<ForexEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ForexEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  
  // Filters
  const [impactFilters, setImpactFilters] = useState({
    high: true,
    medium: true,
    low: true
  });
  
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Record<string, boolean>>({});

  // Function to fetch economic events
  const fetchEconomicEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      
      // Store the current real data status before fetching
      const wasMockData = isMockData;
      
      console.log(`Fetching economic events for ${year}-${month + 1}`);
      
      // Try to get events
      const events = await forexFactoryService.getEvents(year, month);
      
      console.log(`Received ${events.length} events`);
      
      // Check for data quality
      const hasHighImpact = events.some(e => e.impact === 'high');
      const hasMediumImpact = events.some(e => e.impact === 'medium');
      
      if (events.length === 0 || (!hasHighImpact && !hasMediumImpact)) {
        console.log("Data quality check failed - empty or all low impact");
        setIsMockData(true);
      } else {
        setIsMockData(false);
        console.log("Using real data from Forex Factory");
      }
      
      setEconomicEvents(events);
      setLastRefreshed(new Date());
      
      // If we were using mock data before and now we got real data, show success toast
      if (wasMockData && !isMockData) {
        toast.success('Successfully fetched real economic calendar data');
      }
      
      // Extract unique currencies
      const currencies = [...new Set(events.map(event => event.currency))].sort();
      setAvailableCurrencies(currencies);
      
      // Initialize selected currencies if needed
      if (Object.keys(selectedCurrencies).length === 0 || currencies.length !== Object.keys(selectedCurrencies).length) {
        const currencySelections: Record<string, boolean> = {};
        currencies.forEach(currency => {
          currencySelections[currency] = selectedCurrencies[currency] !== undefined ? 
            selectedCurrencies[currency] : true;
        });
        setSelectedCurrencies(currencySelections);
      }
      
    } catch (error) {
      console.error('Failed to fetch economic events:', error);
      setIsMockData(true);
      toast.error('Failed to load economic calendar data. Using fallback data.');
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth, isMockData, selectedCurrencies]);

  // Fetch economic events when the month changes
  useEffect(() => {
    fetchEconomicEvents();
  }, [currentMonth, fetchEconomicEvents]);
  
  // Manual refresh function
  const refreshEvents = async () => {
    setIsLoading(true);
    try {
      // Clear cache for current month to force refresh
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      
      // Store the current mock data status before refreshing
      const wasMockData = isMockData;
      
      // Clear cache and force refresh
      forexFactoryService.clearCache(year, month);
      
      // Force refresh by fetching again
      const events = await forexFactoryService.getEvents(year, month);
      
      // Check for data quality issues
      const hasHighImpact = events.some(e => e.impact === 'high');
      const hasMediumImpact = events.some(e => e.impact === 'medium');
      
      if (events.length === 0 || (!hasHighImpact && !hasMediumImpact)) {
        console.log("Refresh data quality check failed - no high/medium impact events");
        setIsMockData(true);
        toast.warning('Calendar data may be incomplete. Using best available data.');
      } else {
        setIsMockData(false);
      }
      
      setEconomicEvents(events);
      setLastRefreshed(new Date());
      
      // If we transitioned from mock to real data
      if (wasMockData && !isMockData) {
        toast.success('Successfully switched to real economic data');
      } else {
        toast.success('Economic calendar data refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh economic events:', error);
      setIsMockData(true);
      toast.error('Failed to refresh calendar data. Using fallback data.');
    } finally {
      setIsLoading(false);
    }
  };
  
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
    
    // Debug the filtering
    console.log(`Filtered ${economicEvents.length} events to ${filtered.length} events`);
    
    setFilteredEvents(filtered);
  }, [economicEvents, impactFilters, selectedCurrencies, currencyFilter]);

  // Handle impact filter toggle
  const handleToggleImpact = (impact: 'high' | 'medium' | 'low') => {
    setImpactFilters(prev => ({
      ...prev,
      [impact]: !prev[impact]
    }));
  };
  
  // Handle currency filter toggle
  const handleToggleCurrency = (currency: string) => {
    setSelectedCurrencies(prev => ({
      ...prev,
      [currency]: !prev[currency]
    }));
  };
  
  // Handle select all currencies
  const handleSelectAllCurrencies = (selected: boolean) => {
    const updatedSelections: Record<string, boolean> = {};
    availableCurrencies.forEach(currency => {
      updatedSelections[currency] = selected;
    });
    setSelectedCurrencies(updatedSelections);
  };

  return {
    economicEvents,
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
  };
};
