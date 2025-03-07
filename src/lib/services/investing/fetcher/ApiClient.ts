
import { ProxyManager } from './ProxyManager';
import { parseInvestingCalendarHTML } from '../utils/htmlParser';
import { InvestingEvent } from '../types';

/**
 * Handles the HTTP requests to fetch economic calendar data
 */
export class ApiClient {
  private proxyManager: ProxyManager;
  
  constructor() {
    this.proxyManager = new ProxyManager();
  }
  
  /**
   * Attempts to fetch calendar data using direct request
   */
  public async tryDirectFetch(targetUrl: string, year: number, month: number): Promise<InvestingEvent[]> {
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
            console.log(`Direct fetch successful! Got ${extractedEvents.length} events`);
            return extractedEvents;
          }
        }
      }
    } catch (error) {
      console.warn('Direct fetch failed:', error);
    }
    
    return [];
  }
  
  /**
   * Attempts to fetch calendar data using proxies
   */
  public async tryProxyFetch(targetUrl: string, year: number, month: number, maxAttempts: number = 3): Promise<InvestingEvent[]> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const proxy = this.proxyManager.getNextProxy();
        const url = `${proxy}${encodeURIComponent(targetUrl)}`;
        
        console.log(`Proxy attempt ${attempt + 1}/${maxAttempts} with: ${proxy}`);
        
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
          console.log(`Proxy fetch successful with ${extractedEvents.length} events!`);
          return extractedEvents;
        }
      } catch (error) {
        console.warn(`Proxy attempt ${attempt + 1} failed:`, error);
      }
    }
    
    return [];
  }
}
