
import { InvestingEvent } from '../types';

export interface DataQualityResult {
  isValidData: boolean;
  errorMessage: string | null;
}

/**
 * Checks the quality of the economic events data
 */
export function checkDataQuality(events: InvestingEvent[]): DataQualityResult {
  // No events at all is definitely a problem
  if (!events || events.length === 0) {
    return {
      isValidData: false,
      errorMessage: "No economic events found"
    };
  }
  
  // Check if all events are on the same day (could indicate parsing issues)
  const dateSet = new Set<string>();
  events.forEach(event => {
    if (event.date) {
      dateSet.add(event.date.toDateString());
    }
  });
  
  // If we have more than 20 events but only 1-2 days, it might be suspicious
  // (but having just a few events on a few days is fine)
  if (events.length > 20 && dateSet.size <= 2) {
    return {
      isValidData: false,
      errorMessage: `All ${events.length} events are on only ${dateSet.size} days, likely parsing issue`
    };
  }
  
  // Check impact distribution - if everything is "low" it might be suspicious
  const impacts = {
    high: 0,
    medium: 0,
    low: 0
  };
  
  events.forEach(event => {
    if (event.impact in impacts) {
      impacts[event.impact as keyof typeof impacts]++;
    }
  });
  
  // If we have many events but no high/medium impact ones, that's suspicious
  if (events.length > 20 && impacts.high === 0 && impacts.medium === 0) {
    return {
      isValidData: false,
      errorMessage: "No high or medium impact events found, likely incomplete data"
    };
  }
  
  // Check if all events have the same currency (unlikely to be valid)
  const currencies = new Set(events.map(event => event.currency));
  if (events.length > 10 && currencies.size <= 1) {
    return {
      isValidData: false,
      errorMessage: "All events have the same currency, likely incomplete data"
    };
  }
  
  // Everything looks good
  return {
    isValidData: true,
    errorMessage: null
  };
}
