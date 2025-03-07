
import { ForexEvent, SeededRandom } from './types';
import { generateMonthEvents } from './eventGenerators';

class ForexFactoryService {
  private static instance: ForexFactoryService;
  private cachedEvents: Record<string, ForexEvent[]> = {};
  private apiUrl = 'https://financialmodelingprep.com/api/v3/economic_calendar';
  private apiKey = import.meta.env.VITE_FMP_API_KEY || 'demo'; // Use demo key if not provided
  
  private constructor() {}
  
  public static getInstance(): ForexFactoryService {
    if (!ForexFactoryService.instance) {
      ForexFactoryService.instance = new ForexFactoryService();
    }
    return ForexFactoryService.instance;
  }
  
  // Fetch real economic events from Financial Modeling Prep API
  public async getEvents(year: number, month: number): Promise<ForexEvent[]> {
    const cacheKey = `${year}-${month}`;
    
    // Return cached data if available
    if (this.cachedEvents[cacheKey]) {
      console.log(`Using cached data for ${cacheKey}`);
      return this.cachedEvents[cacheKey];
    }
    
    // Format date range for API call (first and last day of month)
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
    
    try {
      console.log(`Fetching economic events for ${formattedStartDate} to ${formattedEndDate}`);
      
      // If we're in demo mode (no API key) or it's February 2025, use the mock data
      if (this.apiKey === 'demo' || (year === 2025 && month === 1)) {
        console.log("Using mock data (demo mode or special Feb 2025 case)");
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Generate events for the specified month - using a seed based on year and month
        const seed = year * 100 + month;
        const random = new SeededRandom(seed);
        const events = generateMonthEvents(year, month, random);
        
        // Cache the results
        this.cachedEvents[cacheKey] = events;
        return events;
      }
      
      // Make real API call to Financial Modeling Prep
      const url = `${this.apiUrl}?from=${formattedStartDate}&to=${formattedEndDate}&apikey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our ForexEvent format
      const events: ForexEvent[] = data.map((item: any) => this.transformApiEvent(item));
      
      // Cache the results
      this.cachedEvents[cacheKey] = events;
      
      return events;
    } catch (error) {
      console.error("Failed to fetch economic events:", error);
      
      // Fallback to mock data in case of API failure
      console.log("Falling back to mock data");
      const seed = year * 100 + month;
      const random = new SeededRandom(seed);
      return generateMonthEvents(year, month, random);
    }
  }
  
  // Format date as YYYY-MM-DD for API
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Transform API response to our ForexEvent format
  private transformApiEvent(item: any): ForexEvent {
    // Map impact level from API format to our format
    let impact: 'high' | 'medium' | 'low' = 'low';
    if (item.impact === 'High') impact = 'high';
    else if (item.impact === 'Medium') impact = 'medium';
    
    // Format time from API (typically in "HH:MM:SS" format)
    const timeString = item.time ? item.time.substring(0, 5) : "All Day";
    
    // Convert to AM/PM format for consistency with our existing code
    const formattedTime = this.formatTimeToAMPM(timeString);
    
    return {
      date: new Date(item.date),
      time: formattedTime,
      currency: item.country || "USD", // Default to USD if country not specified
      impact: impact,
      name: item.event,
      forecast: item.estimate,
      previous: item.previous,
      actual: item.actual
    };
  }
  
  // Format time from 24h to AM/PM
  private formatTimeToAMPM(time: string): string {
    if (time === "All Day") return time;
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}

// Export the singleton instance
export const forexFactoryService = ForexFactoryService.getInstance();

// Re-export types for convenience
export type { ForexEvent } from './types';
