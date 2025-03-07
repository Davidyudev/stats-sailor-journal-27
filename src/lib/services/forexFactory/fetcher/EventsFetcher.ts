
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
        if (timeSinceLastAttempt < 30 * 60 * 1000) {
          console.log('Using mock data due to multiple failed attempts');
          return this.generateMockEvents(year, month);
        }
        this.failedAttempts = 0;
      }
      
      if (this.isRefreshing) {
        console.log('Another refresh is in progress, using mock data');
        return this.generateMockEvents(year, month);
      }
      
      this.isRefreshing = true;
      this.lastRefreshAttempt = new Date();
      
      const urlMonth = String(month + 1).padStart(2, '0');
      const proxyUrl = 'https://corsproxy.io/';
      const targetUrl = `https://www.forexfactory.com/calendar?month=${year}.${urlMonth}`;
      const url = `${proxyUrl}?${encodeURIComponent(targetUrl)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; TraderJournalApp/1.0)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const html = await response.text();
      
      if (!html || html.length < 1000) {
        throw new Error('Received empty or invalid HTML response');
      }
      
      if (!html.includes('calendarComponentStates')) {
        throw new Error('HTML does not contain expected calendar data');
      }
      
      const events = extractCalendarData(html, year, month);
      
      if (events.length === 0) {
        throw new Error('Failed to extract any events from HTML');
      }
      
      const hasHighImpact = events.some(e => e.impact === 'high');
      const hasMediumImpact = events.some(e => e.impact === 'medium');
      
      if (!hasHighImpact && !hasMediumImpact) {
        throw new Error('Data quality check failed - all events are low impact');
      }
      
      this.isRefreshing = false;
      this.failedAttempts = 0;
      
      return events;
    } catch (error) {
      console.error("Failed to fetch economic events:", error);
      this.isRefreshing = false;
      this.failedAttempts++;
      return this.generateMockEvents(year, month);
    }
  }
  
  private generateMockEvents(year: number, month: number): ForexEvent[] {
    console.log("Falling back to mock data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    return generateMonthEvents(year, month, random);
  }
  
  public resetFailedAttempts(): void {
    this.failedAttempts = 0;
  }
}

export const eventsFetcher = EventsFetcher.getInstance();
