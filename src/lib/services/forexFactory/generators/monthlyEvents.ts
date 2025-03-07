
import { ForexEvent, SeededRandom } from '../types';
import { findNthDayOfWeek } from '../helpers';

// Generate common monthly economic events
export function generateCommonMonthlyEvents(
  events: ForexEvent[],
  year: number,
  month: number,
  random: SeededRandom
): void {
  // First Friday: NFP (Non-Farm Payrolls)
  const firstFriday = findNthDayOfWeek(1, 5, year, month); // 1st Friday (day 5)
  events.push({
    date: new Date(year, month, firstFriday),
    time: "8:30 AM",
    currency: "USD",
    impact: "high",
    name: "Non-Farm Payrolls",
    forecast: `${random.nextInt(120, 200)}K`,
    previous: `${random.nextInt(130, 210)}K`,
    actual: random.chance(0.5) ? `${random.nextInt(100, 220)}K` : undefined
  });
  
  events.push({
    date: new Date(year, month, firstFriday),
    time: "8:30 AM",
    currency: "USD",
    impact: "high",
    name: "Unemployment Rate",
    forecast: `${(random.nextFloat(3, 4.5)).toFixed(1)}%`,
    previous: `${(random.nextFloat(3, 4.5)).toFixed(1)}%`,
    actual: random.chance(0.5) ? `${(random.nextFloat(3, 4.5)).toFixed(1)}%` : undefined
  });
  
  // Add FOMC meeting (usually 3rd Wednesday)
  const thirdWednesday = findNthDayOfWeek(3, 3, year, month); // 3rd Wednesday (day 3)
  if (random.chance(0.7)) { // Not every month has an FOMC meeting
    events.push({
      date: new Date(year, month, thirdWednesday),
      time: "2:00 PM",
      currency: "USD",
      impact: "high",
      name: "FOMC Statement",
      forecast: "",
      previous: "",
      actual: random.chance(0.5) ? "" : undefined
    });
    
    events.push({
      date: new Date(year, month, thirdWednesday),
      time: "2:00 PM",
      currency: "USD",
      impact: "high",
      name: "Federal Funds Rate",
      forecast: `${(random.nextFloat(4.5, 5.5)).toFixed(2)}%`,
      previous: `${(random.nextFloat(4.5, 5.5)).toFixed(2)}%`,
      actual: random.chance(0.5) ? `${(random.nextFloat(4.5, 5.5)).toFixed(2)}%` : undefined
    });
  }
  
  // Add ECB meeting (usually 2nd Thursday)
  const secondThursday = findNthDayOfWeek(2, 4, year, month); // 2nd Thursday (day 4)
  if (random.chance(0.7)) { // Not every month has an ECB meeting
    events.push({
      date: new Date(year, month, secondThursday),
      time: "7:45 AM",
      currency: "EUR",
      impact: "high",
      name: "Main Refinancing Rate",
      forecast: `${(random.nextFloat(3.5, 4.5)).toFixed(2)}%`,
      previous: `${(random.nextFloat(3.5, 4.5)).toFixed(2)}%`,
      actual: random.chance(0.5) ? `${(random.nextFloat(3.5, 4.5)).toFixed(2)}%` : undefined
    });
    
    events.push({
      date: new Date(year, month, secondThursday),
      time: "8:30 AM",
      currency: "EUR",
      impact: "high",
      name: "ECB Press Conference",
      forecast: "",
      previous: "",
      actual: random.chance(0.5) ? "" : undefined
    });
  }
}
