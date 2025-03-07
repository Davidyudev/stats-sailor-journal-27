
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
      console.log(`Using cached ${cachedData.events.length} events for ${year}-${month + 1}`);
      return cachedData.events;
    }
    
    return null;
  }
  
  public set(year: number, month: number, events: InvestingEvent[]): void {
    if (!events || events.length === 0) {
      console.warn(`Not caching empty event list for ${year}-${month + 1}`);
      return;
    }
    
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
    console.log(`Cleared cache for ${year}-${month + 1}`);
  }
  
  public clearAll(): void {
    this.cache.clear();
    console.log('Cleared all cached economic events');
  }
  
  // Check if cache is stale and needs refreshing
  public isStale(year: number, month: number): boolean {
    const key = this.getCacheKey(year, month);
    const cachedData = this.cache.get(key);
    
    if (!cachedData) return true;
    
    const timeSinceCache = Date.now() - cachedData.timestamp;
    return timeSinceCache > this.cacheDuration;
  }
  
  // Set cache duration in minutes
  public setCacheDuration(minutes: number): void {
    this.cacheDuration = minutes * 60 * 1000;
    console.log(`Set cache duration to ${minutes} minutes`);
  }
}

export const eventsCache = EventsCache.getInstance();
