
import { ForexEvent, SeededRandom, HIGH_IMPACT_EVENTS, MEDIUM_IMPACT_EVENTS, LOW_IMPACT_EVENTS } from './types';
import { findNthDayOfWeek, addRandomEvent } from './eventHelpers';

// Generate common monthly economic events
export function generateCommonMonthlyEvents(
  events: ForexEvent[],
  year: number,
  month: number,
  random: SeededRandom
): void {
  // First Friday: NFP (Non-Farm Payrolls)
  const firstFriday = findNthDayOfWeek(1, 5, year, month); // 1st Friday (day 5)
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
  const thirdWednesday = findNthDayOfWeek(3, 3, year, month); // 3rd Wednesday (day 3)
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
  const secondThursday = findNthDayOfWeek(2, 4, year, month); // 2nd Thursday (day 4)
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
}

// Generate events for February 28, 2025 (special case)
export function generateFeb28Events(events: ForexEvent[]): void {
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

// Generate realistic events for a month
export function generateMonthEvents(year: number, month: number, random: SeededRandom): ForexEvent[] {
  const events: ForexEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Add common monthly events (NFP, FOMC, ECB, etc.)
  generateCommonMonthlyEvents(events, year, month, random);
  
  // Now fill in the rest of the month with various events
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Skip weekends for most events (fewer events on weekends)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (random.chance(0.15)) {
        addRandomEvent(events, date, random, "low", LOW_IMPACT_EVENTS);
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
      addRandomEvent(
        events, 
        date, 
        random, 
        impact, 
        impact === 'high' ? HIGH_IMPACT_EVENTS : 
          impact === 'medium' ? MEDIUM_IMPACT_EVENTS : LOW_IMPACT_EVENTS
      );
    }
    
    // Special case for Feb 28, 2025 to match the screenshot more closely
    if (year === 2025 && month === 1 && day === 28) {
      generateFeb28Events(events);
    }
  }
  
  return events;
}
