
import { ForexEvent } from './forexFactory/types';
import { forexFactoryService } from './forexFactory/forexFactoryService';
import { fredService } from './fred/fredService';
import { adaptFredToForexEvents } from './fred/adapter';

// Economic calendar data source options
export type DataSource = 'forexfactory' | 'fred';

class EconomicCalendarService {
  private static instance: EconomicCalendarService;
  private dataSource: DataSource = 'fred'; // Default to FRED
  private fredApiKey: string = '';
  
  private constructor() {}
  
  public static getInstance(): EconomicCalendarService {
    if (!EconomicCalendarService.instance) {
      EconomicCalendarService.instance = new EconomicCalendarService();
    }
    return EconomicCalendarService.instance;
  }
  
  public setDataSource(source: DataSource): void {
    this.dataSource = source;
    console.log(`Economic calendar data source set to: ${source}`);
  }
  
  public getDataSource(): DataSource {
    return this.dataSource;
  }
  
  public setFredApiKey(apiKey: string): void {
    this.fredApiKey = apiKey;
    fredService.setApiKey(apiKey);
    console.log('FRED API key has been set');
  }
  
  // Fetch economic events using the selected data source
  public async getEvents(year: number, month: number): Promise<ForexEvent[]> {
    try {
      if (this.dataSource === 'fred') {
        const fredEvents = await fredService.getEvents(year, month);
        // Convert FRED events to ForexEvent format
        return adaptFredToForexEvents(fredEvents);
      } else {
        // Use ForexFactory as fallback
        return await forexFactoryService.getEvents(year, month);
      }
    } catch (error) {
      console.error(`Error fetching events from ${this.dataSource}:`, error);
      // If one source fails, try the other
      try {
        if (this.dataSource === 'fred') {
          console.log('Falling back to ForexFactory');
          return await forexFactoryService.getEvents(year, month);
        } else {
          console.log('Falling back to FRED');
          const fredEvents = await fredService.getEvents(year, month);
          return adaptFredToForexEvents(fredEvents);
        }
      } catch (fallbackError) {
        console.error('Fallback source also failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  }
  
  // Clear cache for a specific month
  public clearCache(year: number, month: number): void {
    if (this.dataSource === 'fred') {
      fredService.clearCache(year, month);
    } else {
      forexFactoryService.clearCache(year, month);
    }
  }
}

// Export the singleton instance
export const economicCalendarService = EconomicCalendarService.getInstance();

// Re-export the ForexEvent type for convenience
export type { ForexEvent };
