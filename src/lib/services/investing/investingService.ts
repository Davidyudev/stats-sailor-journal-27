
import { InvestingEvent } from './types';
import { eventsCache } from './cache/EventsCache';
import { eventsFetcher } from './fetcher/EventsFetcher';

class InvestingService {
  private static instance: InvestingService;
  
  private constructor() {}
  
  public static getInstance(): InvestingService {
    if (!InvestingService.instance) {
      InvestingService.instance = new InvestingService();
    }
    return InvestingService.instance;
  }
  
  // Fetch economic events from Investing.com
  public async getEvents(year: number, month: number): Promise<InvestingEvent[]> {
    // Return cached data if available
    const cachedEvents = eventsCache.get(year, month);
    if (cachedEvents) {
      console.log(`Using cached data for ${year}-${month}`);
      return cachedEvents;
    }
    
    // Fetch new data
    try {
      console.log(`Fetching fresh data for ${year}-${month + 1}`);
      const events = await eventsFetcher.fetchEvents(year, month);
      
      // Cache the results only if we got some events
      if (events && events.length > 0) {
        eventsCache.set(year, month, events);
      }
      
      return events;
    } catch (error) {
      console.error(`Error fetching economic events for ${year}-${month + 1}:`, error);
      return [];
    }
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
    if ((window as any).__investingRefreshInterval) {
      clearInterval((window as any).__investingRefreshInterval);
    }
    
    console.log(`Setting up periodic refresh every ${intervalMinutes} minutes`);
    
    // Set interval to refresh data
    (window as any).__investingRefreshInterval = setInterval(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Check if cache is stale before refreshing
      if (eventsCache.isStale(currentYear, currentMonth)) {
        console.log(`Cache is stale, refreshing data for ${currentYear}-${currentMonth + 1}`);
        
        // Clear cache for current month to force refresh
        this.clearCache(currentYear, currentMonth);
        
        // Trigger refresh
        this.getEvents(currentYear, currentMonth)
          .then((events) => {
            console.log(`Successfully refreshed data at ${new Date().toLocaleTimeString()}`);
            console.log(`Fetched ${events.length} events`);
          })
          .catch(err => console.error('Failed to refresh data:', err));
      } else {
        console.log(`Cache is still valid for ${currentYear}-${currentMonth + 1}, skipping refresh`);
      }
    }, intervalMinutes * 60 * 1000);
  }
  
  // Change cache duration
  public setCacheDuration(minutes: number): void {
    eventsCache.setCacheDuration(minutes);
  }
}

// Export the singleton instance
export const investingService = InvestingService.getInstance();

// Setup periodic refresh when the module is loaded
investingService.setupPeriodicRefresh();

// Re-export types for convenience
export type { InvestingEvent } from './types';
export type { ForexEvent } from './types';
