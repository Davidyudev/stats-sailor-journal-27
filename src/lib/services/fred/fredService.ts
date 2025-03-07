
import { FredEvent } from './types';
import { eventsCache } from './cache/EventsCache';
import { eventsFetcher } from './fetcher/EventsFetcher';

class FredService {
  private static instance: FredService;
  
  private constructor() {}
  
  public static getInstance(): FredService {
    if (!FredService.instance) {
      FredService.instance = new FredService();
    }
    return FredService.instance;
  }
  
  // Set API key
  public setApiKey(apiKey: string): void {
    eventsFetcher.setApiKey(apiKey);
  }
  
  // Fetch economic events from FRED API
  public async getEvents(year: number, month: number): Promise<FredEvent[]> {
    // Return cached data if available
    const cachedEvents = eventsCache.get(year, month);
    if (cachedEvents) {
      console.log(`Using cached FRED data for ${year}-${month}`);
      return cachedEvents;
    }
    
    // Fetch new data
    const events = await eventsFetcher.fetchEvents(year, month);
    
    // Cache the results
    eventsCache.set(year, month, events);
    
    return events;
  }
  
  // Manual refresh - clear cache for a specific month
  public clearCache(year: number, month: number): void {
    eventsCache.clear(year, month);
    eventsFetcher.resetFailedAttempts();
    console.log(`Cleared FRED cache for ${year}-${month}`);
  }
  
  // Setup periodic refresh of data
  public setupPeriodicRefresh(intervalMinutes: number = 60): void {
    // Clear any existing intervals first
    if ((window as any).__fredRefreshInterval) {
      clearInterval((window as any).__fredRefreshInterval);
    }
    
    console.log(`Setting up periodic FRED refresh every ${intervalMinutes} minutes`);
    
    // Set interval to refresh data
    (window as any).__fredRefreshInterval = setInterval(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Clear cache for current month to force refresh
      this.clearCache(currentYear, currentMonth);
      
      // Trigger refresh
      this.getEvents(currentYear, currentMonth)
        .then((events) => {
          console.log(`Successfully refreshed FRED data at ${new Date().toLocaleTimeString()}`);
          console.log(`Fetched ${events.length} events`);
        })
        .catch(err => console.error('Failed to refresh FRED data:', err));
    }, intervalMinutes * 60 * 1000);
  }
}

// Export the singleton instance
export const fredService = FredService.getInstance();

// Setup periodic refresh when the module is loaded
fredService.setupPeriodicRefresh(120); // Refresh every 2 hours

// Re-export types for convenience
export type { FredEvent } from './types';
