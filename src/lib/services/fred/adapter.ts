
import { FredEvent } from './types';
import { ForexEvent } from '../forexFactory/types';

/**
 * Converts FRED events to the ForexEvent format used in the application
 */
export function adaptFredToForexEvents(fredEvents: FredEvent[]): ForexEvent[] {
  return fredEvents.map(fredEvent => {
    return {
      id: fredEvent.id,
      date: fredEvent.date,
      time: fredEvent.time,
      name: fredEvent.name,
      impact: fredEvent.impact,
      currency: fredEvent.currency,
      forecast: fredEvent.forecast || '',
      previous: fredEvent.previous || '',
      actual: fredEvent.actual || ''
    };
  });
}
