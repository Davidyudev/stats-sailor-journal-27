
import { InvestingEvent } from '../../types';

/**
 * Counts the distribution of different impact levels in the events
 */
export function countImpacts(events: InvestingEvent[]): Record<string, number> {
  return events.reduce((acc, event) => {
    acc[event.impact] = (acc[event.impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Evaluates data quality and logs warnings if needed
 */
export function evaluateDataQuality(events: InvestingEvent[], html: string): string[] {
  const warnings: string[] = [];
  
  // Check for suspiciously low number of events
  if (events.length < 5) {
    const warning = 'Very few events parsed, HTML parsing may have failed';
    warnings.push(warning);
    console.warn(warning);
    
    // Log some diagnostic info
    console.log('HTML snippet:', html.substring(0, 500));
  }
  
  return warnings;
}
