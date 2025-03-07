
import { InvestingEvent } from '../types';

/**
 * Evaluates the quality of the fetched economic events data
 * 
 * @param events List of economic events to evaluate
 * @returns Object containing quality check results and error message if any
 */
export function checkDataQuality(events: InvestingEvent[]): {
  isValidData: boolean;
  errorMessage: string | null;
} {
  // Check if we have any events
  const hasEvents = events.length > 0;
  if (!hasEvents) {
    return {
      isValidData: false,
      errorMessage: "No events could be retrieved"
    };
  }

  // Check for high and medium impact events
  const hasHighImpact = events.some(e => e.impact === 'high');
  const hasMediumImpact = events.some(e => e.impact === 'medium');
  
  if (!hasHighImpact && !hasMediumImpact) {
    return {
      isValidData: false,
      errorMessage: "Only low-impact events found, data may be incomplete"
    };
  }

  // Data passed all checks
  return {
    isValidData: true,
    errorMessage: null
  };
}
