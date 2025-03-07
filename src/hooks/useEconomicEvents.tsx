
import { useEventsFetching, useEventFilters } from './economic-calendar';

export const useEconomicEvents = (currentMonth: Date) => {
  // Use the fetching hook for data retrieval and loading state
  const {
    economicEvents,
    isLoading,
    lastRefreshed,
    refreshEvents,
    isMockData,
    fetchError
  } = useEventsFetching(currentMonth);
  
  // Use the filters hook for all filtering operations
  const {
    filteredEvents,
    impactFilters,
    currencyFilter,
    setCurrencyFilter,
    availableCurrencies,
    selectedCurrencies,
    handleToggleImpact,
    handleToggleCurrency,
    handleSelectAllCurrencies
  } = useEventFilters(economicEvents);

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
    isMockData,
    fetchError
  };
};
