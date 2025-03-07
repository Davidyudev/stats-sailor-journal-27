
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
    const events: ForexEvent[] = this.generateRealisticEventsForMonth(year, month);
    
    // Cache the results
    this.cachedEvents[cacheKey] = events;
    
    return events;
  }
  
  // More realistic event data generator that mimics ForexFactory calendar
  private generateRealisticEventsForMonth(year: number, month: number): ForexEvent[] {
    const events: ForexEvent[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create a seeded random generator
    const seed = year * 100 + month;
    const random = new SeededRandom(seed);
    
    // Full list of currencies
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY'];
    
    // More comprehensive event types by impact level
    const highImpactEvents = [
      'Interest Rate Decision', 
      'Non-Farm Payrolls', 
      'CPI m/m', 
      'GDP q/q', 
      'Unemployment Rate',
      'FOMC Statement',
      'Federal Funds Rate',
      'Core PCE Price Index m/m',
      'ECB Press Conference',
      'BOE Inflation Report',
      'Employment Change',
      'President Speaks',
      'Prelim GDP q/q',
      'German Prelim CPI m/m',
      'ISM Manufacturing PMI'
    ];
    
    const mediumImpactEvents = [
      'Retail Sales m/m',
      'Manufacturing PMI',
      'Services PMI',
      'Trade Balance',
      'Industrial Production m/m',
      'Chicago PMI',
      'Building Permits',
      'Housing Starts',
      'Prelim UoM Consumer Sentiment',
      'Factory Orders m/m',
      'Durable Goods Orders m/m',
      'Private Sector Credit m/m',
      'Wholesale Inventories m/m',
      'Consumer Spending m/m',
      'Retail Sales y/y',
      'KOF Economic Barometer'
    ];
    
    const lowImpactEvents = [
      'Housing Starts',
      'Building Permits',
      'Consumer Confidence',
      'Existing Home Sales',
      'Pending Home Sales',
      'API Weekly Crude Oil Stock',
      'Crude Oil Inventories',
      'Natural Gas Storage',
      'Import Prices m/m',
      'JOLTS Job Openings',
      'Flash Services PMI',
      'Flash Manufacturing PMI',
      'German Import Prices m/m',
      'German Retail Sales m/m',
      'Nationwide HPI m/m',
      'MPC Member Speaks',
      'French Consumer Spending m/m',
      'French Final Private Payrolls q/q',
      'French Prelim CPI m/m',
      'French Prelim GDP q/q',
      'Italian Prelim CPI m/m',
      'German Unemployment Change'
    ];
    
    // Add common monthly events that happen on specific days
    // First Friday: NFP (Non-Farm Payrolls)
    const firstFriday = this.findNthDayOfWeek(1, 5, year, month); // 1st Friday (day 5)
    events.push({
      date: new Date(year, month, firstFriday),
      time: "8:30 AM",
      currency: "USD",
      impact: "high",
      name: "Non-Farm Payrolls",
      forecast: `${random.nextInt(120, 200)}K`,
      previous: `${random.nextInt(130, 210)}K`,
      actual: random.chance(0.5) ? `${random.nextInt(100, 220)}K` : undefined
    });
    
    events.push({
      date: new Date(year, month, firstFriday),
      time: "8:30 AM",
      currency: "USD",
      impact: "high",
      name: "Unemployment Rate",
      forecast: `${(random.nextFloat(3, 4.5)).toFixed(1)}%`,
      previous: `${(random.nextFloat(3, 4.5)).toFixed(1)}%`,
      actual: random.chance(0.5) ? `${(random.nextFloat(3, 4.5)).toFixed(1)}%` : undefined
    });
    
    // Add FOMC meeting (usually 3rd Wednesday)
    const thirdWednesday = this.findNthDayOfWeek(3, 3, year, month); // 3rd Wednesday (day 3)
    if (random.chance(0.7)) { // Not every month has an FOMC meeting
      events.push({
        date: new Date(year, month, thirdWednesday),
        time: "2:00 PM",
        currency: "USD",
        impact: "high",
        name: "FOMC Statement",
        forecast: "",
        previous: "",
        actual: random.chance(0.5) ? "" : undefined
      });
      
      events.push({
        date: new Date(year, month, thirdWednesday),
        time: "2:00 PM",
        currency: "USD",
        impact: "high",
        name: "Federal Funds Rate",
        forecast: `${(random.nextFloat(4.5, 5.5)).toFixed(2)}%`,
        previous: `${(random.nextFloat(4.5, 5.5)).toFixed(2)}%`,
        actual: random.chance(0.5) ? `${(random.nextFloat(4.5, 5.5)).toFixed(2)}%` : undefined
      });
    }
    
    // Add ECB meeting (usually 2nd Thursday)
    const secondThursday = this.findNthDayOfWeek(2, 4, year, month); // 2nd Thursday (day 4)
    if (random.chance(0.7)) { // Not every month has an ECB meeting
      events.push({
        date: new Date(year, month, secondThursday),
        time: "7:45 AM",
        currency: "EUR",
        impact: "high",
        name: "Main Refinancing Rate",
        forecast: `${(random.nextFloat(3.5, 4.5)).toFixed(2)}%`,
        previous: `${(random.nextFloat(3.5, 4.5)).toFixed(2)}%`,
        actual: random.chance(0.5) ? `${(random.nextFloat(3.5, 4.5)).toFixed(2)}%` : undefined
      });
      
      events.push({
        date: new Date(year, month, secondThursday),
        time: "8:30 AM",
        currency: "EUR",
        impact: "high",
        name: "ECB Press Conference",
        forecast: "",
        previous: "",
        actual: random.chance(0.5) ? "" : undefined
      });
    }
    
    // Now fill in the rest of the month with various events
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Skip weekends for most events (fewer events on weekends)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (random.chance(0.15)) {
          this.addRandomEvent(events, date, random, currencies, "low", lowImpactEvents);
        }
        continue;
      }
      
      // Add more events on weekdays
      const numEvents = random.nextInt(3, 8); // More realistic number of events per day
      
      for (let i = 0; i < numEvents; i++) {
        // Determine impact level with realistic distribution
        let impact: 'high' | 'medium' | 'low';
        const roll = random.next();
        
        if (roll > 0.85) {
          impact = 'high';
        } else if (roll > 0.5) {
          impact = 'medium';
        } else {
          impact = 'low';
        }
        
        // Add the event
        this.addRandomEvent(
          events, 
          date, 
          random, 
          currencies, 
          impact, 
          impact === 'high' ? highImpactEvents : 
            impact === 'medium' ? mediumImpactEvents : lowImpactEvents
        );
      }
      
      // Special case for Feb 28, 2025 to match the screenshot more closely
      if (year === 2025 && month === 1 && day === 28) {
        this.addFeb28Events(events);
      }
    }
    
    return events;
  }
  
  // Find the nth occurrence of a day of the week in a month
  private findNthDayOfWeek(nth: number, dayOfWeek: number, year: number, month: number): number {
    let count = 0;
    let day = 1;
    
    while (count < nth && day <= 31) {
      const date = new Date(year, month, day);
      if (date.getDay() === dayOfWeek) {
        count++;
        if (count === nth) {
          return day;
        }
      }
      day++;
    }
    
    return -1; // Not found
  }
  
  // Add a random event to the events array
  private addRandomEvent(
    events: ForexEvent[], 
    date: Date, 
    random: SeededRandom, 
    currencies: string[], 
    impact: 'high' | 'medium' | 'low',
    eventNames: string[]
  ) {
    const currency = random.choose(currencies);
    const name = random.choose(eventNames);
    
    // Generate a realistic time
    const hour = random.nextInt(7, 17); // Between 7 AM and 5 PM
    const minute = random.chance(0.75) ? 
      random.choose([0, 15, 30, 45]) : // Most events happen on quarter hours
      random.nextInt(0, 59);
    
    const timeString = `${hour}:${minute < 10 ? '0' + minute : minute} ${hour < 12 ? 'AM' : 'PM'}`;
    
    // Generate realistic forecast and previous values
    const isPercentage = name.includes('Rate') || name.includes('CPI') || 
                         name.includes('GDP') || name.includes('PMI');
    const isLargeNumber = name.includes('Payrolls') || name.includes('NFP') || 
                          name.includes('Employment') || name.includes('Change');
    
    let forecastValue: string, previousValue: string;
    
    if (isPercentage) {
      const baseValue = random.nextFloat(-2, 5);
      forecastValue = `${baseValue.toFixed(1)}%`;
      previousValue = `${(baseValue + (random.nextFloat(-0.5, 0.5))).toFixed(1)}%`;
    } else if (isLargeNumber) {
      const baseValue = random.nextInt(-50, 200);
      forecastValue = `${baseValue}K`;
      previousValue = `${baseValue + random.nextInt(-30, 30)}K`;
    } else {
      const baseValue = random.nextFloat(-3, 3);
      forecastValue = `${baseValue.toFixed(1)}B`;
      previousValue = `${(baseValue + random.nextFloat(-1, 1)).toFixed(1)}B`;
    }
    
    // Some events don't have forecast/previous values
    const hasForecast = random.chance(0.85);
    const hasPrevious = random.chance(0.9);
    const hasActual = random.chance(0.5); // 50% chance the event already happened
    
    events.push({
      date: new Date(date),
      time: timeString,
      currency,
      impact,
      name: `${name}`,
      forecast: hasForecast ? forecastValue : undefined,
      previous: hasPrevious ? previousValue : undefined,
      actual: hasActual ? (hasForecast ? 
        `${(parseFloat(forecastValue) + random.nextFloat(-0.4, 0.4)).toFixed(1)}${isPercentage ? '%' : isLargeNumber ? 'K' : 'B'}` 
        : undefined) : undefined
    });
  }
  
  // Adds specific events for Feb 28, 2025 to match the screenshot
  private addFeb28Events(events: ForexEvent[]) {
    // Clear any existing events for this day
    const feb28 = new Date(2025, 1, 28);
    const feb28String = feb28.toDateString();
    
    // Remove existing events for Feb 28
    const filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() !== feb28String;
    });
    
    events.length = 0;
    events.push(...filteredEvents);
    
    // Add the specific events matching the screenshot
    const eventsToAdd: Array<Omit<ForexEvent, 'date'>> = [
      {
        time: "12:30 AM",
        currency: "AUD",
        impact: "medium",
        name: "Private Sector Credit m/m",
        forecast: "0.3%",
        previous: "0.4%"
      },
      {
        time: "5:00 AM",
        currency: "JPY",
        impact: "medium",
        name: "Housing Starts y/y",
        forecast: "-0.9%",
        previous: "0.2%"
      },
      {
        time: "7:00 AM",
        currency: "EUR",
        impact: "medium",
        name: "German Import Prices m/m",
        forecast: "-0.2%",
        previous: "0.1%"
      },
      {
        time: "7:00 AM",
        currency: "EUR",
        impact: "medium",
        name: "German Retail Sales m/m",
        forecast: "0.3%",
        previous: "-1.6%"
      },
      {
        time: "7:00 AM",
        currency: "GBP",
        impact: "medium",
        name: "MPC Member Ramsden Speaks",
        forecast: "",
        previous: ""
      },
      {
        time: "7:00 AM",
        currency: "GBP",
        impact: "medium",
        name: "Nationwide HPI m/m",
        forecast: "0.1%",
        previous: "-0.2%"
      },
      {
        time: "All Day",
        currency: "EUR",
        impact: "high",
        name: "German Prelim CPI m/m",
        forecast: "0.4%",
        previous: "-0.2%"
      },
      {
        time: "7:30 AM",
        currency: "CHF",
        impact: "medium",
        name: "Retail Sales y/y",
        forecast: "-0.6%",
        previous: "0.8%"
      },
      {
        time: "7:45 AM",
        currency: "EUR",
        impact: "medium",
        name: "French Consumer Spending m/m",
        forecast: "0.2%",
        previous: "-0.2%"
      },
      {
        time: "7:45 AM",
        currency: "EUR",
        impact: "medium",
        name: "French Final Private Payrolls q/q",
        forecast: "0.2%",
        previous: "0.2%"
      },
      {
        time: "7:45 AM",
        currency: "EUR",
        impact: "medium",
        name: "French Prelim CPI m/m",
        forecast: "0.3%",
        previous: "-0.2%"
      },
      {
        time: "7:45 AM",
        currency: "EUR",
        impact: "medium",
        name: "French Prelim GDP q/q",
        forecast: "0.2%",
        previous: "0.2%"
      },
      {
        time: "8:00 AM",
        currency: "CHF",
        impact: "medium",
        name: "KOF Economic Barometer",
        forecast: "98.3",
        previous: "97.8"
      },
      {
        time: "8:55 AM",
        currency: "EUR",
        impact: "medium",
        name: "German Unemployment Change",
        forecast: "12K",
        previous: "11K"
      },
      {
        time: "10:00 AM",
        currency: "EUR",
        impact: "medium",
        name: "Italian Prelim CPI m/m",
        forecast: "0.2%",
        previous: "-0.2%"
      },
      {
        time: "1:30 PM",
        currency: "CAD",
        impact: "high",
        name: "GDP m/m",
        forecast: "0.2%",
        previous: "0.2%"
      },
      {
        time: "1:30 PM",
        currency: "USD",
        impact: "high",
        name: "Core PCE Price Index m/m",
        forecast: "0.3%",
        previous: "0.2%"
      },
      {
        time: "1:30 PM",
        currency: "USD",
        impact: "medium",
        name: "Goods Trade Balance",
        forecast: "-91.0B",
        previous: "-90.3B"
      },
      {
        time: "1:30 PM",
        currency: "USD",
        impact: "medium",
        name: "Personal Income m/m",
        forecast: "0.3%",
        previous: "0.3%"
      },
      {
        time: "1:30 PM",
        currency: "USD",
        impact: "medium",
        name: "Personal Spending m/m",
        forecast: "0.3%",
        previous: "0.2%"
      },
      {
        time: "1:30 PM",
        currency: "USD",
        impact: "medium",
        name: "Prelim Wholesale Inventories m/m",
        forecast: "0.1%",
        previous: "0.4%"
      },
      {
        time: "2:45 PM",
        currency: "USD",
        impact: "medium",
        name: "Chicago PMI",
        forecast: "43.2",
        previous: "46.0"
      },
      {
        time: "5:15 PM",
        currency: "USD",
        impact: "high",
        name: "President Trump Speaks",
        forecast: "",
        previous: ""
      },
      {
        time: "3:30 PM",
        currency: "CHF",
        impact: "medium",
        name: "CHF Manufacturing PMI",
        forecast: "0.3%",
        previous: "-0.3%"
      }
    ];
    
    // Add all the events for Feb 28, 2025
    eventsToAdd.forEach(eventData => {
      events.push({
        date: new Date(feb28),
        ...eventData
      });
    });
  }
}

export const forexFactoryService = ForexFactoryService.getInstance();
