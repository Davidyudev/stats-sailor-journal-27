
import { FredEvent } from '../types';

export class EventsCache {
  private static instance: EventsCache;
  private cachedEvents: Record<string, FredEvent[]> = {};
  
  private constructor() {}
  
  public static getInstance(): EventsCache {
    if (!EventsCache.instance) {
      EventsCache.instance = new EventsCache();
    }
    return EventsCache.instance;
  }
  
  public get(year: number, month: number): FredEvent[] | null {
    const cacheKey = `${year}-${month}`;
    return this.cachedEvents[cacheKey] || null;
  }
  
  public set(year: number, month: number, events: FredEvent[]): void {
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
