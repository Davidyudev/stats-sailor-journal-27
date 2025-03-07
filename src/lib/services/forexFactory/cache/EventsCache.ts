
import { ForexEvent } from '../types';

export class EventsCache {
  private static instance: EventsCache;
  private cachedEvents: Record<string, ForexEvent[]> = {};
  
  private constructor() {}
  
  public static getInstance(): EventsCache {
    if (!EventsCache.instance) {
      EventsCache.instance = new EventsCache();
    }
    return EventsCache.instance;
  }
  
  public get(year: number, month: number): ForexEvent[] | null {
    const cacheKey = `${year}-${month}`;
    return this.cachedEvents[cacheKey] || null;
  }
  
  public set(year: number, month: number, events: ForexEvent[]): void {
    const cacheKey = `${year}-${month}`;
    this.cachedEvents[cacheKey] = events;
  }
  
  public clear(year: number, month: number): void {
    const cacheKey = `${year}-${month}`;
    delete this.cachedEvents[cacheKey];
  }
  
  public clearAll(): void {
    this.cachedEvents = {};
  }
}

export const eventsCache = EventsCache.getInstance();
