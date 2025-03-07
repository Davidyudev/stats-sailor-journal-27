
import { ForexEvent, SeededRandom } from './types';
import { 
  generateCommonMonthlyEvents, 
  generateFeb28Events,
  generateWeekdayEvents 
} from './generators';

// Generate realistic events for a month
export function generateMonthEvents(year: number, month: number, random: SeededRandom): ForexEvent[] {
  const events: ForexEvent[] = [];
  
  // Add common monthly events (NFP, FOMC, ECB, etc.)
  generateCommonMonthlyEvents(events, year, month, random);
  
  // Add events for each day of the month
  generateWeekdayEvents(events, year, month, random);
  
  // Special case for Feb 28, 2025 to match the screenshot more closely
  if (year === 2025 && month === 1) {
    const feb28Date = new Date(year, month, 28);
    if (feb28Date.getMonth() === month) { // Check if the date exists in this month
      generateFeb28Events(events);
    }
  }
  
  return events;
}
