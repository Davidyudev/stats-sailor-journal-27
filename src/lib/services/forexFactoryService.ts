
// A service to fetch and parse economic events from ForexFactory
export interface ForexEvent {
  date: Date;
  time: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  name: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

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
    
    // Generate mock data for the specified month
    const events: ForexEvent[] = this.generateMockEventsForMonth(year, month);
    
    // Cache the results
    this.cachedEvents[cacheKey] = events;
    
    return events;
  }
  
  private generateMockEventsForMonth(year: number, month: number): ForexEvent[] {
    const events: ForexEvent[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    const highImpactEvents = [
      'Interest Rate Decision', 
      'Non-Farm Payrolls', 
      'CPI m/m', 
      'GDP q/q', 
      'Unemployment Rate'
    ];
    const mediumImpactEvents = [
      'Retail Sales m/m',
      'Manufacturing PMI',
      'Services PMI',
      'Trade Balance',
      'Industrial Production m/m'
    ];
    const lowImpactEvents = [
      'Housing Starts',
      'Building Permits',
      'Consumer Confidence',
      'Existing Home Sales',
      'Durable Goods Orders m/m'
    ];
    
    // Add a few significant events spread throughout the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Add more events on weekdays (1-5 are Mon-Fri)
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends for most events
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Only low impact on weekends, and rarely
        if (Math.random() > 0.8) {
          const currency = currencies[Math.floor(Math.random() * currencies.length)];
          const eventName = lowImpactEvents[Math.floor(Math.random() * lowImpactEvents.length)];
          
          events.push({
            date: new Date(year, month, day),
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            currency,
            impact: 'low',
            name: `${currency} ${eventName}`,
            actual: Math.random() > 0.5 ? `${(Math.random() * 5 - 2.5).toFixed(1)}%` : undefined,
            forecast: `${(Math.random() * 2 - 1).toFixed(1)}%`,
            previous: `${(Math.random() * 2 - 1).toFixed(1)}%`
          });
        }
        continue;
      }
      
      // Add 0-3 events per weekday
      const numEvents = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < numEvents; i++) {
        const currency = currencies[Math.floor(Math.random() * currencies.length)];
        
        // Determine impact level - weight toward medium with some high and few low
        let impact: 'high' | 'medium' | 'low';
        const impactRoll = Math.random();
        
        if (impactRoll > 0.8) {
          impact = 'high';
        } else if (impactRoll > 0.3) {
          impact = 'medium';
        } else {
          impact = 'low';
        }
        
        // Select event name based on impact
        let eventName;
        if (impact === 'high') {
          eventName = highImpactEvents[Math.floor(Math.random() * highImpactEvents.length)];
        } else if (impact === 'medium') {
          eventName = mediumImpactEvents[Math.floor(Math.random() * mediumImpactEvents.length)];
        } else {
          eventName = lowImpactEvents[Math.floor(Math.random() * lowImpactEvents.length)];
        }
        
        events.push({
          date: new Date(year, month, day),
          time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
          currency,
          impact,
          name: `${currency} ${eventName}`,
          actual: Math.random() > 0.5 ? `${(Math.random() * 5 - 2.5).toFixed(1)}%` : undefined,
          forecast: `${(Math.random() * 2 - 1).toFixed(1)}%`,
          previous: `${(Math.random() * 2 - 1).toFixed(1)}%`
        });
      }
    }
    
    // Add some key high-impact events that always happen
    // NFP is usually first Friday of the month
    const firstFriday = new Array(7).fill(null).findIndex((_, i) => 
      new Date(year, month, i + 1).getDay() === 5
    ) + 1;
    
    events.push({
      date: new Date(year, month, firstFriday),
      time: '8:30 AM',
      currency: 'USD',
      impact: 'high',
      name: 'USD Non-Farm Payrolls',
      actual: Math.random() > 0.5 ? `${Math.floor(Math.random() * 300 + 100)}K` : undefined,
      forecast: `${Math.floor(Math.random() * 200 + 150)}K`,
      previous: `${Math.floor(Math.random() * 200 + 150)}K`
    });
    
    // Central bank meetings - usually mid-month
    const fedMeetingDay = Math.floor(daysInMonth / 2) + Math.floor(Math.random() * 5) - 2;
    events.push({
      date: new Date(year, month, fedMeetingDay),
      time: '2:00 PM',
      currency: 'USD',
      impact: 'high',
      name: 'USD FOMC Statement & Federal Funds Rate',
      actual: Math.random() > 0.5 ? `${(Math.random() * 2 + 3).toFixed(2)}%` : undefined,
      forecast: `${(Math.random() * 2 + 3).toFixed(2)}%`,
      previous: `${(Math.random() * 2 + 3).toFixed(2)}%`
    });
    
    return events;
  }
}

export const forexFactoryService = ForexFactoryService.getInstance();
