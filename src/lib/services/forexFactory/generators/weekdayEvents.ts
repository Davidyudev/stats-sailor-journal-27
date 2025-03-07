
import { ForexEvent, SeededRandom, HIGH_IMPACT_EVENTS, MEDIUM_IMPACT_EVENTS, LOW_IMPACT_EVENTS } from '../types';
import { addRandomEvent } from '../helpers';

// Generate events for weekdays in the month
export function generateWeekdayEvents(
  events: ForexEvent[],
  year: number,
  month: number,
  random: SeededRandom
): void {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Skip weekends for most events (fewer events on weekends)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (random.chance(0.15)) {
        addRandomEvent(events, date, random, "low", LOW_IMPACT_EVENTS);
      }
      continue;
    }
    
    // Add more events on weekdays
    const numEvents = random.nextInt(3, 8); // More realistic number of events per day
    
    for (let i = 0; i < numEvents; i++) {
      // Determine impact level with realistic distribution
      let impact: 'high' | 'medium' | 'low';
      const roll = random.next();
      
      if (roll > 0.85) {
        impact = 'high';
      } else if (roll > 0.5) {
        impact = 'medium';
      } else {
        impact = 'low';
      }
      
      // Add the event
      addRandomEvent(
        events, 
        date, 
        random, 
        impact, 
        impact === 'high' ? HIGH_IMPACT_EVENTS : 
          impact === 'medium' ? MEDIUM_IMPACT_EVENTS : LOW_IMPACT_EVENTS
      );
    }
  }
}
