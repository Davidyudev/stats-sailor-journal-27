
import { InvestingEvent } from '../types';
import { EventsApi } from './EventsApi';
import { MockEventGenerator } from './MockEventGenerator';

export class EventsFetcher {
  private static instance: EventsFetcher;
  private isRefreshing: boolean = false;
  private lastRefreshAttempt: Date | null = null;
  private failedAttempts: number = 0;
  private maxFailedAttempts: number = 3;
  
  private eventsApi: EventsApi;
  private mockGenerator: MockEventGenerator;
  
  private constructor() {
    this.eventsApi = new EventsApi();
    this.mockGenerator = new MockEventGenerator();
  }
  
  public static getInstance(): EventsFetcher {
    if (!EventsFetcher.instance) {
      EventsFetcher.instance = new EventsFetcher();
    }
    return EventsFetcher.instance;
  }
  
  public async fetchEvents(year: number, month: number): Promise<InvestingEvent[]> {
    try {
      if (this.failedAttempts >= this.maxFailedAttempts && this.lastRefreshAttempt) {
        const timeSinceLastAttempt = Date.now() - this.lastRefreshAttempt.getTime();
        // If we've failed multiple times in the last 30 minutes, use mock data
        if (timeSinceLastAttempt < 30 * 60 * 1000) {
          console.log('Using mock data due to multiple failed attempts');
          return this.mockGenerator.generateMockEvents(year, month);
        }
        // Reset counter after 30 minutes
        this.failedAttempts = 0;
      }
      
      if (this.isRefreshing) {
        console.log('Another refresh is in progress, using mock data');
        return this.mockGenerator.generateMockEvents(year, month);
      }
      
      this.isRefreshing = true;
      this.lastRefreshAttempt = new Date();
      
      // Format month for URL (Investing.com uses MM/YYYY format)
      const formattedMonth = String(month + 1).padStart(2, '0');
      let events: InvestingEvent[] = [];
      let success = false;
      
      // Don't spend too much time trying - use a timeout for the whole operation
      const timeoutPromise = new Promise<InvestingEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Overall timeout reached')), 15000);
      });
      
      // Try alternative approach first (simpler GET request)
      const alternativeEvents = await Promise.race([
        this.eventsApi.tryAlternativeApproach(year, month),
        timeoutPromise
      ]).catch(() => [] as InvestingEvent[]);
      
      if (alternativeEvents.length > 0) {
        this.isRefreshing = false;
        this.failedAttempts = 0;
        return alternativeEvents;
      }
      
      // If alternative failed, try the original API approach but simplified
      try {
        const simplifiedEvents = await this.eventsApi.trySimplifiedApiApproach(year, month);
        if (simplifiedEvents.length > 0) {
          events = simplifiedEvents;
          success = true;
        }
      } catch (error) {
        console.warn('Simplified API approach failed:', error);
      }
      
      this.isRefreshing = false;
      
      if (!success) {
        this.failedAttempts++;
        console.log(`All fetching attempts failed, falling back to mock data. Attempt ${this.failedAttempts}/${this.maxFailedAttempts}`);
        
        // Generate high quality mock data since we're falling back
        return this.mockGenerator.generateEnhancedMockEvents(year, month);
      }
      
      this.failedAttempts = 0;
      return events;
      
    } catch (error) {
      console.error("Critical error in fetchEvents:", error);
      this.isRefreshing = false;
      this.failedAttempts++;
      return this.mockGenerator.generateEnhancedMockEvents(year, month);
    }
  }
  
  public resetFailedAttempts(): void {
    this.failedAttempts = 0;
  }
}

export const eventsFetcher = EventsFetcher.getInstance();
