
import { SeededRandom } from '../types';

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

// Generate a realistic time for an event
export function generateEventTime(random: SeededRandom): string {
  const hour = random.nextInt(7, 17); // Between 7 AM and 5 PM
  const minute = random.chance(0.75) ? 
    random.choose([0, 15, 30, 45]) : // Most events happen on quarter hours
    random.nextInt(0, 59);
  
  return `${hour}:${minute < 10 ? '0' + minute : minute} ${hour < 12 ? 'AM' : 'PM'}`;
}
