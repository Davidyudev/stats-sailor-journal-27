
import { ForexEvent, SeededRandom, CURRENCIES } from '../types';
import { generateEventTime } from './dateHelpers';
import { 
  generateForecastValue, 
  generatePreviousValue, 
  generateActualValue 
} from './valueGenerators';

// Add a random event to the events array
export function addRandomEvent(
  events: ForexEvent[], 
  date: Date, 
  random: SeededRandom, 
  impact: 'high' | 'medium' | 'low',
  eventNames: string[]
): void {
  const currency = random.choose(CURRENCIES);
  const name = random.choose(eventNames);
  const timeString = generateEventTime(random);
  
  // Generate realistic forecast and previous values
  const hasForecast = random.chance(0.85);
  const hasPrevious = random.chance(0.9);
  const hasActual = random.chance(0.5); // 50% chance the event already happened
  
  let forecastValue: string | undefined = undefined;
  let previousValue: string | undefined = undefined;
  let actualValue: string | undefined = undefined;
  
  if (hasForecast) {
    forecastValue = generateForecastValue(name, random);
  }
  
  if (hasPrevious) {
    previousValue = forecastValue ? 
      generatePreviousValue(forecastValue, name, random) : 
      generateForecastValue(name, random); // Generate from scratch if no forecast
  }
  
  if (hasActual && hasForecast) {
    actualValue = generateActualValue(forecastValue, name, random);
  }
  
  events.push({
    date: new Date(date),
    time: timeString,
    currency,
    impact,
    name: `${name}`,
    forecast: forecastValue,
    previous: previousValue,
    actual: actualValue
  });
}
