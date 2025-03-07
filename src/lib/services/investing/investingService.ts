
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
    if ((window as any).__investingRefreshInterval) {
      clearInterval((window as any).__investingRefreshInterval);
    }
    
    console.log(`Setting up periodic refresh every ${intervalMinutes} minutes`);
    
    // Set interval to refresh data
    (window as any).__investingRefreshInterval = setInterval(() => {
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
export const investingService = InvestingService.getInstance();

// Setup periodic refresh when the module is loaded
investingService.setupPeriodicRefresh();

// Re-export types for convenience
export type { InvestingEvent } from './types';
export type { ForexEvent } from './types';
