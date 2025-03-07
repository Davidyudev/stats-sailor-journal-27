
import { InvestingEvent } from '../types';

class EventsCache {
  private static instance: EventsCache;
  private cache: Map<string, { events: InvestingEvent[], timestamp: number }> = new Map();
  private cacheDuration: number = 30 * 60 * 1000; // 30 minutes in ms
  
  private constructor() {}
  
  public static getInstance(): EventsCache {
    if (!EventsCache.instance) {
      EventsCache.instance = new EventsCache();
    }
    return EventsCache.instance;
  }
  
  private getCacheKey(year: number, month: number): string {
    return `${year}-${month}`;
  }
  
  public get(year: number, month: number): InvestingEvent[] | null {
    const key = this.getCacheKey(year, month);
    const cachedData = this.cache.get(key);
    
    // Check if cache exists and is still valid
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheDuration)) {
      return cachedData.events;
    }
    
    return null;
  }
  
  public set(year: number, month: number, events: InvestingEvent[]): void {
    const key = this.getCacheKey(year, month);
    this.cache.set(key, {
      events,
      timestamp: Date.now()
    });
    console.log(`Cached ${events.length} events for ${year}-${month + 1}`);
  }
  
  public clear(year: number, month: number): void {
    const key = this.getCacheKey(year, month);
    this.cache.delete(key);
  }
  
  public clearAll(): void {
    this.cache.clear();
  }
}

export const eventsCache = EventsCache.getInstance();
