
import { ForexEvent, SeededRandom } from './types';
import { generateMonthEvents } from './eventGenerators';

class ForexFactoryService {
  private static instance: ForexFactoryService;
  private cachedEvents: Record<string, ForexEvent[]> = {};
  private isRefreshing: boolean = false;
  private lastRefreshAttempt: Date | null = null;
  
  private constructor() {}
  
  public static getInstance(): ForexFactoryService {
    if (!ForexFactoryService.instance) {
      ForexFactoryService.instance = new ForexFactoryService();
    }
    return ForexFactoryService.instance;
  }
  
  // Fetch economic events from Forex Factory website
  public async getEvents(year: number, month: number): Promise<ForexEvent[]> {
    const cacheKey = `${year}-${month}`;
    
    // Return cached data if available
    if (this.cachedEvents[cacheKey]) {
      console.log(`Using cached data for ${cacheKey}`);
      return this.cachedEvents[cacheKey];
    }
    
    try {
      // Don't attempt to fetch if we've tried recently and failed
      if (this.lastRefreshAttempt) {
        const timeSinceLastAttempt = Date.now() - this.lastRefreshAttempt.getTime();
        if (timeSinceLastAttempt < 5 * 60 * 1000) { // 5 minutes
          console.log('Using mock data due to recent failed attempt');
          return this.generateMockEvents(year, month);
        }
      }
      
      if (this.isRefreshing) {
        console.log('Another refresh is in progress, using mock data');
        return this.generateMockEvents(year, month);
      }
      
      this.isRefreshing = true;
      this.lastRefreshAttempt = new Date();
      
      console.log(`Fetching economic events from Forex Factory for ${year}-${month+1}`);
      
      // Format month for URL (1-based, padded with 0)
      const urlMonth = String(month + 1).padStart(2, '0');
      
      // Instead of using cors-anywhere, we'll try a different approach
      // by using an open CORS proxy or a service that's more reliable
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
      const events = this.parseForexFactoryHtml(html, year, month);
      
      // Cache the results
      this.cachedEvents[cacheKey] = events;
      this.isRefreshing = false;
      
      return events;
    } catch (error) {
      console.error("Failed to fetch economic events from Forex Factory:", error);
      this.isRefreshing = false;
      
      // Fallback to mock data in case of scraping failure
      return this.generateMockEvents(year, month);
    }
  }
  
  // Generate mock events as a fallback
  private generateMockEvents(year: number, month: number): ForexEvent[] {
    console.log("Falling back to mock data");
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    return generateMonthEvents(year, month, random);
  }
  
  // Parse HTML from Forex Factory to extract event data
  private parseForexFactoryHtml(html: string, year: number, month: number): ForexEvent[] {
    const events: ForexEvent[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all event rows in the calendar table
    const eventRows = doc.querySelectorAll('.calendar_row');
    
    let currentDate = new Date(year, month, 1);
    
    eventRows.forEach(row => {
      // Extract date if present
      const dateCell = row.querySelector('.calendar__date');
      if (dateCell && dateCell.textContent?.trim()) {
        const dateText = dateCell.textContent.trim();
        const dayMatch = dateText.match(/\d+/);
        if (dayMatch) {
          const day = parseInt(dayMatch[0]);
          currentDate = new Date(year, month, day);
        }
      }
      
      // Extract event data
      const currencyElement = row.querySelector('.calendar__currency');
      const impactElement = row.querySelector('.calendar__impact');
      const eventElement = row.querySelector('.calendar__event');
      const timeElement = row.querySelector('.calendar__time');
      const actualElement = row.querySelector('.calendar__actual');
      const forecastElement = row.querySelector('.calendar__forecast');
      const previousElement = row.querySelector('.calendar__previous');
      
      if (currencyElement && eventElement) {
        // Determine impact level
        let impact: 'high' | 'medium' | 'low' = 'low';
        if (impactElement) {
          const impactClass = impactElement.className;
          if (impactClass.includes('high')) impact = 'high';
          else if (impactClass.includes('medium')) impact = 'medium';
        }
        
        // Format time
        const timeText = timeElement?.textContent?.trim() || 'All Day';
        const formattedTime = this.formatTimeToAMPM(timeText);
        
        events.push({
          date: new Date(currentDate),
          time: formattedTime,
          currency: currencyElement.textContent?.trim() || '',
          impact: impact,
          name: eventElement.textContent?.trim() || '',
          forecast: forecastElement?.textContent?.trim() || '',
          previous: previousElement?.textContent?.trim() || '',
          actual: actualElement?.textContent?.trim() || undefined
        });
      }
    });
    
    return events;
  }
  
  // Format time from 24h to AM/PM
  private formatTimeToAMPM(time: string): string {
    if (time === "All Day" || !time || time === "") return "All Day";
    
    // Handle common time formats from Forex Factory
    if (time.includes('am') || time.includes('pm')) {
      // Already in AM/PM format
      return time.toUpperCase().replace('AM', ' AM').replace('PM', ' PM').trim();
    }
    
    // Try to parse 24-hour format
    const timeMatch = time.match(/(\d{1,2}):?(\d{2})/);
    if (timeMatch) {
      const [, hours, minutes] = timeMatch;
      const hrs = parseInt(hours);
      const period = hrs >= 12 ? 'PM' : 'AM';
      const formattedHours = hrs % 12 || 12; // Convert 0 to 12 for 12 AM
      
      return `${formattedHours}:${minutes} ${period}`;
    }
    
    return time; // Return original if we can't parse it
  }
  
  // Manual refresh - clear cache for a specific month
  public clearCache(year: number, month: number): void {
    const cacheKey = `${year}-${month}`;
    this.cachedEvents[cacheKey] = undefined as any;
    console.log(`Cleared cache for ${cacheKey}`);
  }
  
  // Setup periodic refresh of data
  public setupPeriodicRefresh(intervalMinutes: number = 60): void {
    // Clear any existing intervals first
    if ((window as any).__forexFactoryRefreshInterval) {
      clearInterval((window as any).__forexFactoryRefreshInterval);
    }
    
    console.log(`Setting up periodic refresh every ${intervalMinutes} minutes`);
    
    // Set interval to refresh data
    (window as any).__forexFactoryRefreshInterval = setInterval(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Clear cache for current month to force refresh
      this.clearCache(currentYear, currentMonth);
      
      // Trigger refresh
      this.getEvents(currentYear, currentMonth)
        .then(() => console.log(`Successfully refreshed data at ${new Date().toLocaleTimeString()}`))
        .catch(err => console.error('Failed to refresh data:', err));
    }, intervalMinutes * 60 * 1000);
  }
}

// Export the singleton instance
export const forexFactoryService = ForexFactoryService.getInstance();

// Setup periodic refresh when the module is loaded
forexFactoryService.setupPeriodicRefresh();

// Re-export types for convenience
export type { ForexEvent } from './types';
