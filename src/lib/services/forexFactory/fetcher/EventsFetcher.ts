
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
  private proxyIndex: number = 0; // Track which proxy we're using
  
  private constructor() {}
  
  public static getInstance(): EventsFetcher {
    if (!EventsFetcher.instance) {
      EventsFetcher.instance = new EventsFetcher();
    }
    return EventsFetcher.instance;
  }
  
  // List of available proxies with rotation
  private getNextProxy(): string {
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.org/?', // New alternative
      'https://thingproxy.freeboard.io/fetch/' // Another alternative
    ];
    
    // Rotate through proxies
    const proxy = proxies[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % proxies.length;
    return proxy;
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
      const targetUrl = `https://www.forexfactory.com/calendar?month=${year}.${urlMonth}`;
      let events: ForexEvent[] = [];
      let success = false;
      
      // Try multiple times with different proxies
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (success) break;
        
        try {
          const proxy = this.getNextProxy();
          const url = `${proxy}${encodeURIComponent(targetUrl)}`;
          
          console.log(`Attempt ${attempt + 1}/${maxAttempts}: Fetching with proxy: ${proxy}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': 'https://www.google.com/'
            },
            // Add a reasonable timeout
            signal: AbortSignal.timeout(15000)
          });
          
          if (!response.ok) {
            console.warn(`Proxy ${proxy} failed with status: ${response.status}`);
            continue;
          }
          
          const html = await response.text();
          
          if (!html || html.length < 1000) {
            console.warn(`Proxy ${proxy} returned too little data (${html.length} bytes)`);
            continue;
          }
          
          console.log(`Got HTML (${html.length} bytes), extracting events...`);
          
          // Check if we have the expected calendar data in the HTML
          if (!html.includes('calendar_row') && !html.includes('calendarComponentStates')) {
            console.warn(`HTML doesn't contain expected calendar data`);
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
          console.warn(`Error with attempt ${attempt + 1}/${maxAttempts}:`, error);
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
