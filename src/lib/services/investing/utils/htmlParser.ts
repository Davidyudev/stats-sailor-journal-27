
import { InvestingEvent } from '../types';
import { parseInvestingEvents } from './parser/eventParser';

/**
 * Main parsing function - facade for the detailed parser implementation
 */
export function parseInvestingCalendarHTML(html: string, year: number, month: number): InvestingEvent[] {
  const result = parseInvestingEvents(html, { year, month, verbose: true });
  return result.events;
}
