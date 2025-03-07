
import { InvestingEvent } from '../types';
import { ApiClient } from './ApiClient';

/**
 * Handles the different API approaches to fetch calendar data
 */
export class EventsApi {
  private apiClient: ApiClient;
  
  constructor() {
    this.apiClient = new ApiClient();
  }
  
  /**
   * Tries the alternative approach (simple GET page)
   */
  public async tryAlternativeApproach(year: number, month: number): Promise<InvestingEvent[]> {
    try {
      console.log('Trying alternative approach...');
      // Instead of the POST endpoint, try the GET calendar page
      const targetUrl = `https://www.investing.com/economic-calendar/`;
      
      // Try direct fetch first
      const directEvents = await this.apiClient.tryDirectFetch(targetUrl, year, month);
      if (directEvents.length > 0) {
        return directEvents;
      }
      
      // Try with proxies
      const proxyEvents = await this.apiClient.tryProxyFetch(targetUrl, year, month, 3);
      if (proxyEvents.length > 0) {
        return proxyEvents;
      }
    } catch (error) {
      console.error('All alternative approaches failed:', error);
    }
    
    return [];
  }
  
  /**
   * Tries the simplified API approach (current week's data)
   */
  public async trySimplifiedApiApproach(year: number, month: number): Promise<InvestingEvent[]> {
    try {
      console.log('Trying simplified API approach...');
      
      // Use a much simpler approach - just get the current week's data
      const targetUrl = 'https://www.investing.com/economic-calendar/';
      
      // Try with proxies
      const events = await this.apiClient.tryProxyFetch(targetUrl, year, month, 3);
      if (events.length > 0) {
        console.log(`Simplified API approach successful with ${events.length} events!`);
        return events;
      }
    } catch (error) {
      console.warn('Simplified API approach failed:', error);
    }
    
    return [];
  }
}
