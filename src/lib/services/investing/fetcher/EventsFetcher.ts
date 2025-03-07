
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
    // Updated proxy list with more reliable options
    const proxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.org/?',
      'https://thingproxy.freeboard.io/fetch/',
      'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    // Rotate through proxies
    const proxy = proxies[this.proxyIndex];
    this.proxyIndex = (this.proxyIndex + 1) % proxies.length;
    return proxy;
  }
  
  // Try a simpler endpoint that's more likely to work
  private async tryAlternativeApproach(year: number, month: number): Promise<InvestingEvent[]> {
    try {
      console.log('Trying alternative approach...');
      // Instead of the POST endpoint, try the GET calendar page
      const targetUrl = `https://www.investing.com/economic-calendar/`;
      
      // Try direct fetch first
      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          signal: AbortSignal.timeout(8000)
        });
        
        if (response.ok) {
          const html = await response.text();
          if (html && html.length > 1000) {
            const extractedEvents = parseInvestingCalendarHTML(html, year, month);
            if (extractedEvents.length > 0) {
              console.log(`Direct fetch of main page successful! Got ${extractedEvents.length} events`);
              return extractedEvents;
            }
          }
        }
      } catch (directError) {
        console.warn('Direct fetch of main page failed:', directError);
      }
      
      // Try with proxies
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const proxy = this.getNextProxy();
          const url = `${proxy}${encodeURIComponent(targetUrl)}`;
          
          console.log(`Alternative attempt ${attempt + 1}/3 with proxy: ${proxy}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            signal: AbortSignal.timeout(8000)
          });
          
          if (!response.ok) continue;
          
          const html = await response.text();
          if (!html || html.length < 1000) continue;
          
          const extractedEvents = parseInvestingCalendarHTML(html, year, month);
          if (extractedEvents.length > 0) {
            console.log(`Alternative approach successful with ${extractedEvents.length} events!`);
            return extractedEvents;
          }
        } catch (error) {
          console.warn(`Alternative approach failed with attempt ${attempt + 1}:`, error);
        }
      }
    } catch (error) {
      console.error('All alternative approaches failed:', error);
    }
    
    return [];
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
      let events: InvestingEvent[] = [];
      let success = false;
      
      // Don't spend too much time trying - use a timeout for the whole operation
      const timeoutPromise = new Promise<InvestingEvent[]>((_, reject) => {
        setTimeout(() => reject(new Error('Overall timeout reached')), 15000);
      });
      
      // Try alternative approach first (simpler GET request)
      const alternativeEvents = await Promise.race([
        this.tryAlternativeApproach(year, month),
        timeoutPromise
      ]).catch(() => [] as InvestingEvent[]);
      
      if (alternativeEvents.length > 0) {
        this.isRefreshing = false;
        this.failedAttempts = 0;
        return alternativeEvents;
      }
      
      // If alternative failed, try the original API approach but simplified
      try {
        // Use current date filter instead of month filter
        // This is more likely to have data available in the default view
        console.log('Trying simplified API approach...');
        
        // Use a much simpler approach - just get the current week's data
        const targetUrl = 'https://www.investing.com/economic-calendar/';
        
        // Try with proxies
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const proxy = this.getNextProxy();
            const url = `${proxy}${encodeURIComponent(targetUrl)}`;
            
            console.log(`API simplified attempt ${attempt + 1}/3 with proxy: ${proxy}`);
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              },
              signal: AbortSignal.timeout(8000)
            });
            
            if (!response.ok) continue;
            
            const html = await response.text();
            if (!html || html.length < 1000) continue;
            
            const extractedEvents = parseInvestingCalendarHTML(html, year, month);
            if (extractedEvents.length > 0) {
              events = extractedEvents;
              success = true;
              console.log(`Simplified API approach successful with ${events.length} events!`);
              break;
            }
          } catch (error) {
            console.warn(`Simplified API approach failed with attempt ${attempt + 1}:`, error);
          }
        }
      } catch (error) {
        console.warn('Simplified API approach failed:', error);
      }
      
      this.isRefreshing = false;
      
      if (!success) {
        this.failedAttempts++;
        console.log(`All fetching attempts failed, falling back to mock data. Attempt ${this.failedAttempts}/${this.maxFailedAttempts}`);
        
        // Generate high quality mock data since we're falling back
        return this.generateEnhancedMockEvents(year, month);
      }
      
      this.failedAttempts = 0;
      return events;
      
    } catch (error) {
      console.error("Critical error in fetchEvents:", error);
      this.isRefreshing = false;
      this.failedAttempts++;
      return this.generateEnhancedMockEvents(year, month);
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
  
  private generateEnhancedMockEvents(year: number, month: number): InvestingEvent[] {
    // Generate more realistic mock data with better coverage
    console.log("Generating enhanced mock calendar data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    let events = generateMockEvents(year, month, random);
    
    // Add more high impact events spread throughout the month
    events = addHighImpactEvents(events, year, month);
    
    // Make sure we have events for USD, EUR, GBP, JPY as these are important
    const importantCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
    importantCurrencies.forEach(currency => {
      if (!events.some(e => e.currency === currency)) {
        // Add at least one high impact event for this currency
        const day = Math.floor(random.next() * 28) + 1;
        const eventDate = new Date(year, month, day);
        events.push({
          id: `mock-${currency}-${day}`,
          date: eventDate,
          time: '12:30',
          country: currency.toLowerCase(),
          currency,
          impact: 'high',
          name: `${currency} Mock Economic Report`,
          forecast: `${(random.next() * 10).toFixed(1)}%`,
          previous: `${(random.next() * 10).toFixed(1)}%`,
        });
      }
    });
    
    return events;
  }
  
  public resetFailedAttempts(): void {
    this.failedAttempts = 0;
  }
}

export const eventsFetcher = EventsFetcher.getInstance();
