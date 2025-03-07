
import { ForexEvent, SeededRandom } from './types';
import { generateMonthEvents } from './eventGenerators';

class ForexFactoryService {
  private static instance: ForexFactoryService;
  private cachedEvents: Record<string, ForexEvent[]> = {};
  private isRefreshing: boolean = false;
  private lastRefreshAttempt: Date | null = null;
  private failedAttempts: number = 0;
  private maxFailedAttempts: number = 3;
  
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
      // Don't attempt to fetch if we've tried recently and failed multiple times
      if (this.failedAttempts >= this.maxFailedAttempts && this.lastRefreshAttempt) {
        const timeSinceLastAttempt = Date.now() - this.lastRefreshAttempt.getTime();
        if (timeSinceLastAttempt < 30 * 60 * 1000) { // 30 minutes
          console.log('Using mock data due to multiple failed attempts');
          return this.generateMockEvents(year, month);
        } else {
          // Reset failed attempts counter after 30 minutes
          this.failedAttempts = 0;
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
      
      // Check if the HTML contains calendar data
      if (!html.includes('calendar__row') && !html.includes('calendar_row')) {
        throw new Error('HTML does not contain expected calendar data');
      }
      
      const events = this.parseForexFactoryHtml(html, year, month);
      
      if (events.length === 0) {
        throw new Error('Failed to parse any events from HTML');
      }
      
      // Cache the results
      this.cachedEvents[cacheKey] = events;
      this.isRefreshing = false;
      this.failedAttempts = 0; // Reset failed attempts on success
      
      return events;
    } catch (error) {
      console.error("Failed to fetch economic events from Forex Factory:", error);
      this.isRefreshing = false;
      this.failedAttempts++; // Increment failed attempts counter
      
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
    
    // Find all calendar weeks in the table
    const calendarWeeks = doc.querySelectorAll('.calendar__week, .calendar_week');
    
    if (calendarWeeks.length === 0) {
      console.error('No calendar weeks found in HTML');
      
      // Fallback to looking for individual rows if weeks aren't found
      const eventRows = doc.querySelectorAll('.calendar__row, .calendar_row');
      if (eventRows.length === 0) {
        return events;
      } else {
        console.log(`Found ${eventRows.length} event rows in HTML (without weeks)`);
        return this.parseEventRows(eventRows, year, month);
      }
    }
    
    console.log(`Found ${calendarWeeks.length} calendar weeks in HTML`);
    
    // Process each week
    calendarWeeks.forEach(week => {
      // Find the date header for this week
      const dateHeader = week.querySelector('.calendar__date-header, .calendar_date-header');
      const dateText = dateHeader ? dateHeader.textContent?.trim() : '';
      
      // Find all event rows in this week
      const eventRows = week.querySelectorAll('.calendar__row, .calendar_row');
      console.log(`Found ${eventRows.length} events in week: ${dateText}`);
      
      // Extract and add events from this week
      const weekEvents = this.parseEventRows(eventRows, year, month);
      events.push(...weekEvents);
    });
    
    console.log(`Successfully parsed ${events.length} events`);
    return events;
  }
  
  // Parse individual event rows to extract event data
  private parseEventRows(rows: NodeListOf<Element>, year: number, month: number): ForexEvent[] {
    const events: ForexEvent[] = [];
    let currentDate = new Date(year, month, 1);
    
    rows.forEach(row => {
      try {
        // Extract date if present
        const dateCell = row.querySelector('.calendar__date, .calendar_date');
        if (dateCell && dateCell.textContent?.trim()) {
          const dateText = dateCell.textContent.trim();
          const dayMatch = dateText.match(/\d+/);
          if (dayMatch) {
            const day = parseInt(dayMatch[0]);
            currentDate = new Date(year, month, day);
          }
        }
        
        // Extract event data
        const currencyElement = row.querySelector('.calendar__currency, .calendar_currency');
        const impactElement = row.querySelector('.calendar__impact, .calendar_impact');
        const eventElement = row.querySelector('.calendar__event, .calendar_event');
        const timeElement = row.querySelector('.calendar__time, .calendar_time');
        const actualElement = row.querySelector('.calendar__actual, .calendar_actual');
        const forecastElement = row.querySelector('.calendar__forecast, .calendar_forecast');
        const previousElement = row.querySelector('.calendar__previous, .calendar_previous');
        
        if (currencyElement && eventElement) {
          // Determine impact level - check classes, images, and styles
          let impact: 'high' | 'medium' | 'low' = 'low';
          
          if (impactElement) {
            const impactClass = impactElement.className;
            const impactStyle = impactElement.getAttribute('style') || '';
            const impactImage = impactElement.querySelector('img');
            const impactSrc = impactImage ? impactImage.getAttribute('src') : '';
            
            // Check for specific classes
            if (
              impactClass.includes('high') || 
              impactClass.includes('red') || 
              impactStyle.includes('red') ||
              (impactSrc && (
                impactSrc.includes('red') || 
                impactSrc.includes('high') || 
                impactSrc.includes('bull-4')
              ))
            ) {
              impact = 'high';
            }
            else if (
              impactClass.includes('medium') || 
              impactClass.includes('orange') || 
              impactClass.includes('yel') ||
              impactStyle.includes('orange') || 
              impactStyle.includes('yellow') ||
              (impactSrc && (
                impactSrc.includes('orange') || 
                impactSrc.includes('yellow') || 
                impactSrc.includes('medium') || 
                impactSrc.includes('bull-3')
              ))
            ) {
              impact = 'medium';
            }
            
            // Additionally check for color in background or icon
            const bgColor = window.getComputedStyle(impactElement).backgroundColor;
            if (bgColor) {
              if (bgColor.includes('255, 0, 0') || bgColor.includes('255, 51, 51') || bgColor.includes('#ff')) {
                impact = 'high';
              } else if (bgColor.includes('255, 165, 0') || bgColor.includes('255, 255, 0') || bgColor.includes('#fa')) {
                impact = 'medium';
              }
            }
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
      } catch (innerError) {
        console.error('Error parsing row:', innerError);
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
    delete this.cachedEvents[cacheKey];
    console.log(`Cleared cache for ${cacheKey}`);
    
    // Also reset failed attempts counter
    this.failedAttempts = 0;
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
        .then((events) => {
          console.log(`Successfully refreshed data at ${new Date().toLocaleTimeString()}`);
          console.log(`Fetched ${events.length} events`);
        })
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
