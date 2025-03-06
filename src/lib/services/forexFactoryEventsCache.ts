
import { EconomicEvent } from "@/lib/types";

// Singleton class to cache ForexFactory events
class ForexFactoryEventsCache {
  private static instance: ForexFactoryEventsCache;
  private eventsCache: EconomicEvent[] = [];
  private lastFetch: Date | null = null;
  private fetchPromise: Promise<EconomicEvent[]> | null = null;

  private constructor() {}

  public static getInstance(): ForexFactoryEventsCache {
    if (!ForexFactoryEventsCache.instance) {
      ForexFactoryEventsCache.instance = new ForexFactoryEventsCache();
    }
    return ForexFactoryEventsCache.instance;
  }

  public async getEvents(): Promise<EconomicEvent[]> {
    // If we're already fetching, return the promise
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Check if cache is valid (less than 1 hour old)
    const now = new Date();
    if (this.lastFetch && this.eventsCache.length > 0 && 
        (now.getTime() - this.lastFetch.getTime() < 3600000)) {
      return this.eventsCache;
    }

    // Generate mock events if cache is empty or stale
    this.fetchPromise = this.generateMockEvents();
    
    try {
      this.eventsCache = await this.fetchPromise;
      this.lastFetch = new Date();
      return this.eventsCache;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async generateMockEvents(): Promise<EconomicEvent[]> {
    // This function creates consistent mock data that doesn't change on refresh
    const events: EconomicEvent[] = [];
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    const eventNames = [
      'Interest Rate Decision',
      'Non-Farm Payrolls',
      'CPI m/m',
      'GDP q/q',
      'Unemployment Rate',
      'Retail Sales m/m',
      'Manufacturing PMI',
      'Trade Balance'
    ];
    const impacts: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    
    // Create a fixed set of dates for the next 14 days
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    // Use a fixed seed for random values to ensure consistency
    const getRandom = (max: number, seed: number) => {
      return Math.floor((Math.abs(Math.sin(seed) * 10000) % max));
    };
    
    // Generate 50 events with consistent data
    for (let i = 0; i < 50; i++) {
      const dayOffset = getRandom(14, i);
      const hourOffset = getRandom(24, i + 100);
      const minuteOffset = getRandom(12, i + 200) * 5; // 5-minute intervals
      
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + dayOffset);
      eventDate.setHours(hourOffset, minuteOffset, 0, 0);
      
      const currencyIndex = getRandom(currencies.length, i + 300);
      const eventIndex = getRandom(eventNames.length, i + 400);
      const impactIndex = getRandom(impacts.length, i + 500);
      
      const forecastValue = (getRandom(100, i + 600) / 10).toFixed(1) + '%';
      const previousValue = (getRandom(100, i + 700) / 10).toFixed(1) + '%';
      
      events.push({
        date: eventDate,
        name: eventNames[eventIndex],
        impact: impacts[impactIndex],
        forecast: forecastValue,
        previous: previousValue,
        currency: currencies[currencyIndex],
        actual: eventDate < new Date() ? (getRandom(100, i + 800) / 10).toFixed(1) + '%' : undefined,
      });
    }
    
    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return events;
  }
}

export const forexFactoryEventsCache = ForexFactoryEventsCache.getInstance();
