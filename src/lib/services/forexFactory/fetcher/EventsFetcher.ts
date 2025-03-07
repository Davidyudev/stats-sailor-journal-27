
import { ForexEvent } from '../types';
import { extractCalendarData } from '../utils/htmlParser';
import { generateMonthEvents } from '../eventGenerators';
import { SeededRandom } from '../types';

export class EventsFetcher {
  private static instance: EventsFetcher;
  private isRefreshing: boolean = false;
  private lastRefreshAttempt: Date | null = null;
  private failedAttempts: number = 0;
  private maxFailedAttempts: number = 3;
  
  private constructor() {}
  
  public static getInstance(): EventsFetcher {
    if (!EventsFetcher.instance) {
      EventsFetcher.instance = new EventsFetcher();
    }
    return EventsFetcher.instance;
  }
  
  public async fetchEvents(year: number, month: number): Promise<ForexEvent[]> {
    try {
      if (this.failedAttempts >= this.maxFailedAttempts && this.lastRefreshAttempt) {
        const timeSinceLastAttempt = Date.now() - this.lastRefreshAttempt.getTime();
        // If we've failed multiple times in the last 30 minutes, use mock data
        if (timeSinceLastAttempt < 30 * 60 * 1000) {
          console.log('Using mock data due to multiple failed attempts');
          return this.generateMockEvents(year, month);
        }
        // Reset counter after 30 minutes
        this.failedAttempts = 0;
      }
      
      if (this.isRefreshing) {
        console.log('Another refresh is in progress, using mock data');
        return this.generateMockEvents(year, month);
      }
      
      this.isRefreshing = true;
      this.lastRefreshAttempt = new Date();
      
      // Format URL with zero-padded month
      const urlMonth = String(month + 1).padStart(2, '0');
      
      // Try multiple proxies in case one fails
      const proxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/'
      ];
      
      const targetUrl = `https://www.forexfactory.com/calendar?month=${year}.${urlMonth}`;
      let events: ForexEvent[] = [];
      let success = false;
      
      // Try each proxy until one works
      for (const proxy of proxies) {
        if (success) break;
        
        try {
          const url = `${proxy}${encodeURIComponent(targetUrl)}`;
          
          console.log(`Trying to fetch with proxy: ${proxy}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'User-Agent': 'Mozilla/5.0 (compatible; TraderJournalApp/1.0)'
            },
            // Add a reasonable timeout
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            console.warn(`Proxy ${proxy} failed with status: ${response.status}`);
            continue;
          }
          
          const html = await response.text();
          
          if (!html || html.length < 1000) {
            console.warn(`Proxy ${proxy} returned too little data`);
            continue;
          }
          
          const extractedEvents = extractCalendarData(html, year, month);
          
          if (extractedEvents.length === 0) {
            console.warn(`No events extracted with proxy ${proxy}`);
            continue;
          }
          
          // Verify data quality
          const hasHighImpact = extractedEvents.some(e => e.impact === 'high');
          const hasMediumImpact = extractedEvents.some(e => e.impact === 'medium');
          
          if (!hasHighImpact && !hasMediumImpact) {
            console.warn(`Data quality check failed with proxy ${proxy} - all events are low impact`);
            continue;
          }
          
          events = extractedEvents;
          success = true;
          console.log(`Successfully fetched ${events.length} events with proxy ${proxy}`);
        } catch (error) {
          console.warn(`Error with proxy ${proxy}:`, error);
        }
      }
      
      this.isRefreshing = false;
      
      if (!success) {
        this.failedAttempts++;
        console.log(`All proxies failed, falling back to mock data. Attempt ${this.failedAttempts}/${this.maxFailedAttempts}`);
        return this.generateMockEvents(year, month);
      }
      
      this.failedAttempts = 0;
      return events;
      
    } catch (error) {
      console.error("Critical error in fetchEvents:", error);
      this.isRefreshing = false;
      this.failedAttempts++;
      return this.generateMockEvents(year, month);
    }
  }
  
  private generateMockEvents(year: number, month: number): ForexEvent[] {
    console.log("Generating mock calendar data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    return generateMonthEvents(year, month, random);
  }
  
  public resetFailedAttempts(): void {
    this.failedAttempts = 0;
  }
}

export const eventsFetcher = EventsFetcher.getInstance();
