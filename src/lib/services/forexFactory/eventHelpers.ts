
import { ForexEvent, SeededRandom, CURRENCIES, HIGH_IMPACT_EVENTS, MEDIUM_IMPACT_EVENTS, LOW_IMPACT_EVENTS } from './types';

// Find the nth occurrence of a day of the week in a month
export function findNthDayOfWeek(nth: number, dayOfWeek: number, year: number, month: number): number {
  let count = 0;
  let day = 1;
  
  while (count < nth && day <= 31) {
    const date = new Date(year, month, day);
    if (date.getDay() === dayOfWeek) {
      count++;
      if (count === nth) {
        return day;
      }
    }
    day++;
  }
  
  return -1; // Not found
}

// Add a random event to the events array
export function addRandomEvent(
  events: ForexEvent[], 
  date: Date, 
  random: SeededRandom, 
  impact: 'high' | 'medium' | 'low',
  eventNames: string[]
) {
  const currency = random.choose(CURRENCIES);
  const name = random.choose(eventNames);
  
  // Generate a realistic time
  const hour = random.nextInt(7, 17); // Between 7 AM and 5 PM
  const minute = random.chance(0.75) ? 
    random.choose([0, 15, 30, 45]) : // Most events happen on quarter hours
    random.nextInt(0, 59);
  
  const timeString = `${hour}:${minute < 10 ? '0' + minute : minute} ${hour < 12 ? 'AM' : 'PM'}`;
  
  // Generate realistic forecast and previous values
  const isPercentage = name.includes('Rate') || name.includes('CPI') || 
                       name.includes('GDP') || name.includes('PMI');
  const isLargeNumber = name.includes('Payrolls') || name.includes('NFP') || 
                        name.includes('Employment') || name.includes('Change');
  
  let forecastValue: string, previousValue: string;
  
  if (isPercentage) {
    const baseValue = random.nextFloat(-2, 5);
    forecastValue = `${baseValue.toFixed(1)}%`;
    previousValue = `${(baseValue + (random.nextFloat(-0.5, 0.5))).toFixed(1)}%`;
  } else if (isLargeNumber) {
    const baseValue = random.nextInt(-50, 200);
    forecastValue = `${baseValue}K`;
    previousValue = `${baseValue + random.nextInt(-30, 30)}K`;
  } else {
    const baseValue = random.nextFloat(-3, 3);
    forecastValue = `${baseValue.toFixed(1)}B`;
    previousValue = `${(baseValue + random.nextFloat(-1, 1)).toFixed(1)}B`;
  }
  
  // Some events don't have forecast/previous values
  const hasForecast = random.chance(0.85);
  const hasPrevious = random.chance(0.9);
  const hasActual = random.chance(0.5); // 50% chance the event already happened
  
  events.push({
    date: new Date(date),
    time: timeString,
    currency,
    impact,
    name: `${name}`,
    forecast: hasForecast ? forecastValue : undefined,
    previous: hasPrevious ? previousValue : undefined,
    actual: hasActual ? (hasForecast ? 
      `${(parseFloat(forecastValue) + random.nextFloat(-0.4, 0.4)).toFixed(1)}${isPercentage ? '%' : isLargeNumber ? 'K' : 'B'}` 
      : undefined) : undefined
  });
}
