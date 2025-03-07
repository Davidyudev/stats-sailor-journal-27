
import { SeededRandom } from '../types';

// Determine if an event value should be formatted as a percentage
export function isPercentageEvent(name: string): boolean {
  return name.includes('Rate') || name.includes('CPI') || 
         name.includes('GDP') || name.includes('PMI');
}

// Determine if an event value should be formatted as a large number
export function isLargeNumberEvent(name: string): boolean {
  return name.includes('Payrolls') || name.includes('NFP') || 
         name.includes('Employment') || name.includes('Change');
}

// Generate a realistic forecast value based on the event type
export function generateForecastValue(
  eventName: string, 
  random: SeededRandom
): string {
  if (isPercentageEvent(eventName)) {
    const baseValue = random.nextFloat(-2, 5);
    return `${baseValue.toFixed(1)}%`;
  } else if (isLargeNumberEvent(eventName)) {
    const baseValue = random.nextInt(-50, 200);
    return `${baseValue}K`;
  } else {
    const baseValue = random.nextFloat(-3, 3);
    return `${baseValue.toFixed(1)}B`;
  }
}

// Generate a realistic previous value based on the forecast
export function generatePreviousValue(
  forecast: string, 
  eventName: string, 
  random: SeededRandom
): string {
  // Extract the numeric part and any suffix
  const numericPart = parseFloat(forecast);
  const suffix = forecast.replace(/[\d.-]/g, '');
  
  let variation: number;
  
  if (isPercentageEvent(eventName)) {
    variation = random.nextFloat(-0.5, 0.5);
  } else if (isLargeNumberEvent(eventName)) {
    variation = random.nextInt(-30, 30);
  } else {
    variation = random.nextFloat(-1, 1);
  }
  
  const previousValue = numericPart + variation;
  
  // Format the previous value with the appropriate precision
  if (isPercentageEvent(eventName) || !isLargeNumberEvent(eventName)) {
    return `${previousValue.toFixed(1)}${suffix}`;
  } else {
    return `${Math.round(previousValue)}${suffix}`;
  }
}

// Generate a realistic actual value based on the forecast
export function generateActualValue(
  forecast: string | undefined, 
  eventName: string, 
  random: SeededRandom
): string | undefined {
  if (!forecast) return undefined;
  
  // Extract the numeric part and any suffix
  const numericPart = parseFloat(forecast);
  const suffix = forecast.replace(/[\d.-]/g, '');
  
  const variation = random.nextFloat(-0.4, 0.4);
  const actualValue = numericPart + variation;
  
  // Format the actual value with the appropriate precision
  if (isPercentageEvent(eventName) || !isLargeNumberEvent(eventName)) {
    return `${actualValue.toFixed(1)}${suffix}`;
  } else {
    return `${Math.round(actualValue)}${suffix}`;
  }
}
