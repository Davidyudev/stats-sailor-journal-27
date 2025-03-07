
import { ForexEvent } from './types';
import { eventsCache } from './cache/EventsCache';
import { eventsFetcher } from './fetcher/EventsFetcher';

class ForexFactoryService {
  private static instance: ForexFactoryService;
  
  private constructor() {}
  
  public static getInstance(): ForexFactoryService {
    if (!ForexFactoryService.instance) {
      ForexFactoryService.instance = new ForexFactoryService();
    }
    return ForexFactoryService.instance;
  }
  
  // Fetch economic events from Forex Factory website
  public async getEvents(year: number, month: number): Promise<ForexEvent[]> {
    // Return cached data if available
    const cachedEvents = eventsCache.get(year, month);
    if (cachedEvents) {
      console.log(`Using cached data for ${year}-${month}`);
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
    console.log(`Cleared cache for ${year}-${month}`);
  }
  
  // Setup periodic refresh of data
  public setupPeriodicRefresh(intervalMinutes: number = 60): void {
    // Clear any existing intervals first
    if ((window as any).__forexFactoryRefreshInterval) {
      clearInterval((window as any).__forexFactoryRefreshInterval);
    }
    
    console.log(`Setting up periodic refresh every ${intervalMinutes} minutes`);
    
    // Set interval to refresh data
    (window as any).__forexFactoryRefreshInterval = setInterval(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Clear cache for current month to force refresh
      this.clearCache(currentYear, currentMonth);
      
      // Trigger refresh
      this.getEvents(currentYear, currentMonth)
        .then((events) => {
          console.log(`Successfully refreshed data at ${new Date().toLocaleTimeString()}`);
          console.log(`Fetched ${events.length} events`);
        })
        .catch(err => console.error('Failed to refresh data:', err));
    }, intervalMinutes * 60 * 1000);
  }
}

// Export the singleton instance
export const forexFactoryService = ForexFactoryService.getInstance();

// Setup periodic refresh when the module is loaded
forexFactoryService.setupPeriodicRefresh();

// Re-export types for convenience
export type { ForexEvent } from './types';
