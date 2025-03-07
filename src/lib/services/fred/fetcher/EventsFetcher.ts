
import { FredEvent, FredRelease, FredReleaseDate, RELEASE_IMPACT_MAP, RELEASE_CURRENCY_MAP } from '../types';
import { format } from 'date-fns';

export class EventsFetcher {
  private static instance: EventsFetcher;
  private isRefreshing: boolean = false;
  private lastRefreshAttempt: Date | null = null;
  private failedAttempts: number = 0;
  private maxFailedAttempts: number = 3;
  private apiKey: string = ''; // Initialize empty, can be set later
  
  private constructor() {}
  
  public static getInstance(): EventsFetcher {
    if (!EventsFetcher.instance) {
      EventsFetcher.instance = new EventsFetcher();
    }
    return EventsFetcher.instance;
  }
  
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('FRED API key has been set');
  }

  private getApiKey(): string {
    // For demo purposes - replace with your API key
    // For production, use environment variables or secure storage
    return this.apiKey || 'demo'; // FRED provides a 'demo' key for testing
  }
  
  public async fetchEvents(year: number, month: number): Promise<FredEvent[]> {
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
      
      // Format date range for the specific month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of the month
      
      // Format dates for API
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      console.log(`Fetching FRED releases for ${startDateStr} to ${endDateStr}`);
      
      // Step 1: Fetch all releases
      const releases = await this.fetchReleases();
      
      if (!releases.length) {
        console.warn('No releases fetched from FRED API');
        this.isRefreshing = false;
        this.failedAttempts++;
        return this.generateMockEvents(year, month);
      }
      
      console.log(`Fetched ${releases.length} releases from FRED API`);
      
      // Step 2: Fetch release dates for each release within our date range
      const events: FredEvent[] = [];
      
      // We'll fetch dates for the key economic releases (listed in RELEASE_IMPACT_MAP)
      const keyReleaseIds = Object.keys(RELEASE_IMPACT_MAP)
        .filter(id => id !== 'default')
        .map(id => parseInt(id));
      
      // For each key release, fetch its dates
      for (const releaseId of keyReleaseIds) {
        try {
          const releaseDates = await this.fetchReleaseDates(
            releaseId, 
            startDateStr, 
            endDateStr
          );
          
          if (releaseDates.length) {
            const releaseName = releases.find(r => r.id === releaseId)?.name || 'Unknown Release';
            
            // Convert release dates to economic events
            const releaseEvents = releaseDates.map(releaseDate => {
              // Determine impact level
              const impact = RELEASE_IMPACT_MAP[releaseId] || RELEASE_IMPACT_MAP.default;
              
              // Determine currency (almost all FRED data is USD)
              const currency = RELEASE_CURRENCY_MAP[releaseId] || RELEASE_CURRENCY_MAP.default;
              
              // Create event date object
              const eventDate = new Date(releaseDate.date);
              
              return {
                id: `fred-${releaseId}-${releaseDate.date}`,
                date: eventDate,
                time: '8:30 AM', // Default time for most economic releases
                name: releaseName,
                impact,
                currency,
                forecast: '',
                previous: '',
                actual: ''
              };
            });
            
            events.push(...releaseEvents);
          }
        } catch (error) {
          console.error(`Error fetching dates for release ${releaseId}:`, error);
        }
      }
      
      this.isRefreshing = false;
      
      if (events.length === 0) {
        console.warn('No events found for the specified date range');
        this.failedAttempts++;
        return this.generateMockEvents(year, month);
      }
      
      this.failedAttempts = 0;
      console.log(`Successfully fetched ${events.length} economic events from FRED`);
      return events;
      
    } catch (error) {
      console.error("Critical error in FRED fetchEvents:", error);
      this.isRefreshing = false;
      this.failedAttempts++;
      return this.generateMockEvents(year, month);
    }
  }
  
  private async fetchReleases(): Promise<FredRelease[]> {
    const apiKey = this.getApiKey();
    const url = `https://api.stlouisfed.org/fred/releases?api_key=${apiKey}&file_type=json`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.releases || [];
    } catch (error) {
      console.error('Error fetching FRED releases:', error);
      return [];
    }
  }
  
  private async fetchReleaseDates(
    releaseId: number, 
    startDate: string, 
    endDate: string
  ): Promise<FredReleaseDate[]> {
    const apiKey = this.getApiKey();
    const url = `https://api.stlouisfed.org/fred/release/dates?release_id=${releaseId}&include_release_dates_with_no_data=true&sort_order=desc&api_key=${apiKey}&file_type=json&realtime_start=${startDate}&realtime_end=${endDate}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.release_dates || [];
    } catch (error) {
      console.error(`Error fetching dates for release ${releaseId}:`, error);
      return [];
    }
  }
  
  private generateMockEvents(year: number, month: number): FredEvent[] {
    console.log("Generating mock FRED calendar data");
    const events: FredEvent[] = [];
    
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Generate some mock events
    const mockEvents = [
      { day: 1, name: "Personal Income and Outlays", impact: "high" as const },
      { day: 5, name: "Employment Situation (NFP)", impact: "high" as const },
      { day: 10, name: "Consumer Price Index", impact: "high" as const },
      { day: 12, name: "Producer Price Index", impact: "medium" as const },
      { day: 15, name: "Retail Sales", impact: "high" as const },
      { day: 17, name: "Housing Starts", impact: "medium" as const },
      { day: 20, name: "FOMC Meeting", impact: "high" as const },
      { day: 25, name: "Durable Goods", impact: "medium" as const },
      { day: 28, name: "GDP", impact: "high" as const }
    ];
    
    // Add the mock events to the events array if the day exists in the month
    mockEvents.forEach(mockEvent => {
      if (mockEvent.day <= lastDay) {
        const eventDate = new Date(year, month, mockEvent.day);
        events.push({
          id: `mock-${mockEvent.name}-${year}-${month}-${mockEvent.day}`,
          date: eventDate,
          time: "8:30 AM",
          name: mockEvent.name,
          impact: mockEvent.impact,
          currency: "USD",
          forecast: "N/A",
          previous: "N/A"
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
