
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

// Simple seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1 (similar to Math.random())
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate a random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Generate a random floating point number between min and max
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Return a random element from an array
  choose<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  // Return true with the given probability (0-1)
  chance(probability: number): boolean {
    return this.next() < probability;
  }
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
    
    // Generate mock data for the specified month - using a seed based on year and month
    const events: ForexEvent[] = this.generateMockEventsForMonth(year, month);
    
    // Cache the results
    this.cachedEvents[cacheKey] = events;
    
    return events;
  }
  
  private generateMockEventsForMonth(year: number, month: number): ForexEvent[] {
    const events: ForexEvent[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create a seeded random generator with a seed based on year and month
    // This ensures the same events are generated for the same month and year
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    
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
        if (random.chance(0.2)) {
          const currency = random.choose(currencies);
          const eventName = random.choose(lowImpactEvents);
          
          events.push({
            date: new Date(year, month, day),
            time: `${random.nextInt(1, 12)}:${random.chance(0.5) ? '30' : '00'} ${random.chance(0.5) ? 'AM' : 'PM'}`,
            currency,
            impact: 'low',
            name: `${currency} ${eventName}`,
            actual: random.chance(0.5) ? `${(random.nextFloat(-2.5, 2.5)).toFixed(1)}%` : undefined,
            forecast: `${(random.nextFloat(-1, 1)).toFixed(1)}%`,
            previous: `${(random.nextFloat(-1, 1)).toFixed(1)}%`
          });
        }
        continue;
      }
      
      // Add 0-3 events per weekday
      const numEvents = random.nextInt(0, 3);
      
      for (let i = 0; i < numEvents; i++) {
        const currency = random.choose(currencies);
        
        // Determine impact level - weight toward medium with some high and few low
        let impact: 'high' | 'medium' | 'low';
        const impactRoll = random.next();
        
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
          eventName = random.choose(highImpactEvents);
        } else if (impact === 'medium') {
          eventName = random.choose(mediumImpactEvents);
        } else {
          eventName = random.choose(lowImpactEvents);
        }
        
        events.push({
          date: new Date(year, month, day),
          time: `${random.nextInt(1, 12)}:${random.chance(0.5) ? '30' : '00'} ${random.chance(0.5) ? 'AM' : 'PM'}`,
          currency,
          impact,
          name: `${currency} ${eventName}`,
          actual: random.chance(0.5) ? `${(random.nextFloat(-2.5, 2.5)).toFixed(1)}%` : undefined,
          forecast: `${(random.nextFloat(-1, 1)).toFixed(1)}%`,
          previous: `${(random.nextFloat(-1, 1)).toFixed(1)}%`
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
      actual: random.chance(0.5) ? `${random.nextInt(100, 400)}K` : undefined,
      forecast: `${random.nextInt(150, 350)}K`,
      previous: `${random.nextInt(150, 350)}K`
    });
    
    // Central bank meetings - usually mid-month
    const fedMeetingDay = Math.floor(daysInMonth / 2) + random.nextInt(-2, 2);
    events.push({
      date: new Date(year, month, fedMeetingDay),
      time: '2:00 PM',
      currency: 'USD',
      impact: 'high',
      name: 'USD FOMC Statement & Federal Funds Rate',
      actual: random.chance(0.5) ? `${(random.nextFloat(3, 5)).toFixed(2)}%` : undefined,
      forecast: `${(random.nextFloat(3, 5)).toFixed(2)}%`,
      previous: `${(random.nextFloat(3, 5)).toFixed(2)}%`
    });
    
    return events;
  }
}

export const forexFactoryService = ForexFactoryService.getInstance();
