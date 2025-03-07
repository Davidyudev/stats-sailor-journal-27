
import { ForexEvent, SeededRandom } from './types';
import { generateMonthEvents } from './eventGenerators';

class ForexFactoryService {
  private static instance: ForexFactoryService;
  private cachedEvents: Record<string, ForexEvent[]> = {};
  
  private constructor() {}
  
  public static getInstance(): ForexFactoryService {
    if (!ForexFactoryService.instance) {
      ForexFactoryService.instance = new ForexFactoryService();
    }
    return ForexFactoryService.instance;
  }
  
  // Mock data for now - in a real scenario we would fetch from ForexFactory API or scrape their website
  public async getEvents(year: number, month: number): Promise<ForexEvent[]> {
    const cacheKey = `${year}-${month}`;
    
    // Return cached data if available
    if (this.cachedEvents[cacheKey]) {
      return this.cachedEvents[cacheKey];
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Special case for February 2025 to match expected data
    if (year === 2025 && month === 1) {
      console.log("Generating February 2025 data with specific Feb 28 events");
    }
    
    // Generate events for the specified month - using a seed based on year and month
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    const events = generateMonthEvents(year, month, random);
    
    // Cache the results
    this.cachedEvents[cacheKey] = events;
    
    return events;
  }
}

// Export the singleton instance
export const forexFactoryService = ForexFactoryService.getInstance();

// Re-export types for convenience
export type { ForexEvent } from './types';
