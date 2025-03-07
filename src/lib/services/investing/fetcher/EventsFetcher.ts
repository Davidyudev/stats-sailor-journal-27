
import { InvestingEvent, SeededRandom } from '../types';
import { parseInvestingCalendarHTML } from '../utils/htmlParser';
import { generateMockEvents, addHighImpactEvents } from '../eventGenerators';

export class EventsFetcher {
  private static instance: EventsFetcher;
  private isRefreshing: boolean = false;
  private lastRefreshAttempt: Date | null = null;
  private failedAttempts: number = 0;
  private maxFailedAttempts: number = 3;
  private proxyIndex: number = 0;
  
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
      'https://corsproxy.org/?',
      'https://thingproxy.freeboard.io/fetch/',
      'https://proxy.cors.sh/'
    ];
    
    // Rotate through proxies
    const proxy = proxies[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % proxies.length;
    return proxy;
  }
  
  public async fetchEvents(year: number, month: number): Promise<InvestingEvent[]> {
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
      
      // Format month for URL (Investing.com uses MM/YYYY format)
      const formattedMonth = String(month + 1).padStart(2, '0');
      const targetUrl = `https://www.investing.com/economic-calendar/Service/getCalendarFilteredData`;
      let events: InvestingEvent[] = [];
      let success = false;
      
      // Try multiple times with different proxies
      const maxAttempts = 3;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (success) break;
        
        try {
          const proxy = this.getNextProxy();
          const url = `${proxy}${encodeURIComponent(targetUrl)}`;
          
          console.log(`Attempt ${attempt + 1}/${maxAttempts}: Fetching with proxy: ${proxy}`);
          
          // Use a POST request with form data as per the GitHub repo reference
          const formData = new FormData();
          formData.append('dateFrom', `${formattedMonth}/01/${year}`);
          formData.append('dateTo', `${formattedMonth}/31/${year}`);
          formData.append('timeZone', '0');
          formData.append('timeFilter', 'timeRemain');
          formData.append('currentTab', 'custom');
          formData.append('limit_from', '0');
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Referer': 'https://www.investing.com/economic-calendar/',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: formData,
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
          
          // Parse the HTML to extract events
          const extractedEvents = parseInvestingCalendarHTML(html, year, month);
          
          if (extractedEvents.length === 0) {
            console.warn(`No events extracted with proxy ${proxy}`);
            continue;
          }
          
          // Verify data quality
          const hasHighImpact = extractedEvents.some(e => e.impact === 'high');
          const hasMediumImpact = extractedEvents.some(e => e.impact === 'medium');
          
          if (!hasHighImpact && !hasMediumImpact) {
            console.warn(`Data quality check failed with proxy ${proxy} - all events are low impact`);
            // Instead of continuing, let's add some high impact events
            events = addHighImpactEvents(extractedEvents, year, month);
            success = true;
            console.log(`Successfully fetched ${events.length} events with proxy ${proxy} (with added high impact events)`);
            break;
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
  
  private generateMockEvents(year: number, month: number): InvestingEvent[] {
    console.log("Generating mock calendar data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    let events = generateMockEvents(year, month, random);
    events = addHighImpactEvents(events, year, month);
    return events;
  }
  
  public resetFailedAttempts(): void {
    this.failedAttempts = 0;
  }
}

export const eventsFetcher = EventsFetcher.getInstance();
