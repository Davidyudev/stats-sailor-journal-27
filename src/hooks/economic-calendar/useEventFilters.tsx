
import { useState, useEffect } from 'react';
import { ForexEvent } from '@/lib/services/investingService';

export const useEventFilters = (economicEvents: ForexEvent[]) => {
  // Filters
  const [impactFilters, setImpactFilters] = useState({
    high: true,
    medium: true,
    low: true
  });
  
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Record<string, boolean>>({});
  const [filteredEvents, setFilteredEvents] = useState<ForexEvent[]>([]);

  // Extract available currencies from events
  useEffect(() => {
    if (!economicEvents.length) return;
    
    // Extract unique currencies
    const currencies = [...new Set(economicEvents.map(event => event.currency))].sort();
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
  }, [economicEvents, selectedCurrencies]);

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
    filteredEvents,
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
