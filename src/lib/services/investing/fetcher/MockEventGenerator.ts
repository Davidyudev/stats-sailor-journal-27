
import { InvestingEvent, SeededRandom } from '../types';
import { generateMockEvents, addHighImpactEvents } from '../eventGenerators';

/**
 * Handles the generation of mock events when real data can't be fetched
 */
export class MockEventGenerator {
  /**
   * Generates basic mock events
   */
  public generateMockEvents(year: number, month: number): InvestingEvent[] {
    console.log("Generating mock calendar data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    let events = generateMockEvents(year, month, random);
    events = addHighImpactEvents(events, year, month);
    return events;
  }
  
  /**
   * Generates enhanced mock events with better coverage
   */
  public generateEnhancedMockEvents(year: number, month: number): InvestingEvent[] {
    // Generate more realistic mock data with better coverage
    console.log("Generating enhanced mock calendar data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    let events = generateMockEvents(year, month, random);
    
    // Add more high impact events spread throughout the month
    events = addHighImpactEvents(events, year, month);
    
    // Make sure we have events for USD, EUR, GBP, JPY as these are important
    const importantCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
    importantCurrencies.forEach(currency => {
      if (!events.some(e => e.currency === currency)) {
        // Add at least one high impact event for this currency
        const day = Math.floor(random.next() * 28) + 1;
        const eventDate = new Date(year, month, day);
        events.push({
          id: `mock-${currency}-${day}`,
          date: eventDate,
          time: '12:30',
          country: currency.toLowerCase(),
          currency,
          impact: 'high',
          name: `${currency} Mock Economic Report`,
          forecast: `${(random.next() * 10).toFixed(1)}%`,
          previous: `${(random.next() * 10).toFixed(1)}%`,
        });
      }
    });
    
    return events;
  }
}
