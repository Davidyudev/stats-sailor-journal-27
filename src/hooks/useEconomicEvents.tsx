
import { useState, useEffect } from 'react';
import { getMonth, getYear } from 'date-fns';
import { forexFactoryService, ForexEvent } from '@/lib/services/forexFactoryService';
import { toast } from "sonner";

export const useEconomicEvents = (currentMonth: Date) => {
  const [economicEvents, setEconomicEvents] = useState<ForexEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ForexEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Filters
  const [impactFilters, setImpactFilters] = useState({
    high: true,
    medium: true,
    low: true
  });
  
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Record<string, boolean>>({});

  // Fetch economic events when the month changes
  useEffect(() => {
    const fetchEconomicEvents = async () => {
      setIsLoading(true);
      try {
        const events = await forexFactoryService.getEvents(
          getYear(currentMonth),
          getMonth(currentMonth)
        );
        setEconomicEvents(events);
        setLastRefreshed(new Date());
        
        // Extract unique currencies
        const currencies = [...new Set(events.map(event => event.currency))].sort();
        setAvailableCurrencies(currencies);
        
        // Initialize selected currencies
        const currencySelections: Record<string, boolean> = {};
        currencies.forEach(currency => {
          currencySelections[currency] = true;
        });
        setSelectedCurrencies(currencySelections);
        
      } catch (error) {
        console.error('Failed to fetch economic events:', error);
        toast.error('Failed to load economic calendar data. Using fallback data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEconomicEvents();
  }, [currentMonth]);
  
  // Manual refresh function
  const refreshEvents = async () => {
    setIsLoading(true);
    try {
      // Clear cache for current month to force refresh
      const year = getYear(currentMonth);
      const month = getMonth(currentMonth);
      
      // Force refresh by fetching again
      const events = await forexFactoryService.getEvents(year, month);
      setEconomicEvents(events);
      setLastRefreshed(new Date());
      
      toast.success('Economic calendar data refreshed');
    } catch (error) {
      console.error('Failed to refresh economic events:', error);
      toast.error('Failed to refresh calendar data');
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
    handleSelectAllCurrencies
  };
};
