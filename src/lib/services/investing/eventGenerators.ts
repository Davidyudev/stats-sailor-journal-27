
import { InvestingEvent, SeededRandom, impactFlagMapping, eventNames } from './types';

// Generate mock events for a specific month when actual data fetch fails
export function generateMockEvents(year: number, month: number, random: SeededRandom): InvestingEvent[] {
  const events: InvestingEvent[] = [];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
  
  // Number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Generate 3-7 events per week
  for (let week = 0; week < 5; week++) {
    const eventsThisWeek = Math.floor(random.next() * 5) + 3; // 3-7 events
    
    for (let i = 0; i < eventsThisWeek; i++) {
      // Random day within this week (offset from the start of the month)
      const dayOffset = (week * 7) + Math.floor(random.next() * 7);
      
      // Ensure day is valid for this month
      if (dayOffset >= daysInMonth) continue;
      
      const day = dayOffset + 1;
      
      // Create date object
      const date = new Date(year, month, day);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      
      // Random event details
      const currencyIndex = Math.floor(random.next() * currencies.length);
      const currency = currencies[currencyIndex];
      
      const eventNameIndex = Math.floor(random.next() * Object.keys(eventNames).length) + 1;
      const name = eventNames[eventNameIndex];
      
      const impactLevel = Math.floor(random.next() * 3) + 1;
      const impact = impactFlagMapping[impactLevel] || 'low';
      
      // Random time (8:00 to 17:00)
      const hour = Math.floor(random.next() * 10) + 8;
      const minute = Math.floor(random.next() * 4) * 15; // 0, 15, 30, 45
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Create mock values
      const mockValue = (100 + Math.floor(random.next() * 900) / 10).toFixed(1);
      const mockChange = (random.next() > 0.5 ? '+' : '-') + (Math.floor(random.next() * 100) / 10).toFixed(1);
      
      events.push({
        id: `mock-${year}-${month}-${day}-${i}`,
        date,
        time,
        country: currency.toLowerCase(),
        currency,
        impact,
        name,
        forecast: mockValue,
        previous: (parseFloat(mockValue) + parseFloat(mockChange)).toFixed(1),
        actual: random.next() > 0.6 ? (parseFloat(mockValue) + Math.floor(random.next() * 20 - 10) / 10).toFixed(1) : undefined
      });
    }
  }
  
  // Sort events by date and time
  return events.sort((a, b) => {
    if (a.date.getTime() !== b.date.getTime()) {
      return a.date.getTime() - b.date.getTime();
    }
    return a.time.localeCompare(b.time);
  });
}

export function addHighImpactEvents(events: InvestingEvent[], year: number, month: number): InvestingEvent[] {
  // Ensure we have at least some high-impact events for better UI display
  
  // Find the first Wednesday of the month for FOMC (if it's month 0, 3, 6, or 9)
  if ([0, 3, 6, 9].includes(month)) {
    let firstWednesday = new Date(year, month, 1);
    while (firstWednesday.getDay() !== 3) { // 3 is Wednesday
      firstWednesday.setDate(firstWednesday.getDate() + 1);
    }
    
    events.push({
      id: `fomc-${year}-${month}`,
      date: firstWednesday,
      time: "19:00",
      country: "us",
      currency: "USD",
      impact: "high",
      name: "FOMC Statement",
      forecast: "No Change",
      previous: "No Change"
    });
    
    // Also add Fed interest rate decision
    events.push({
      id: `fedrate-${year}-${month}`,
      date: firstWednesday,
      time: "19:30",
      country: "us",
      currency: "USD",
      impact: "high",
      name: "Fed Interest Rate Decision",
      forecast: "5.50%",
      previous: "5.50%"
    });
  }
  
  // Add NFP on first Friday of month
  if (month % 3 === 0) {
    let firstFriday = new Date(year, month, 1);
    while (firstFriday.getDay() !== 5) { // 5 is Friday
      firstFriday.setDate(firstFriday.getDate() + 1);
    }
    
    events.push({
      id: `nfp-${year}-${month}`,
      date: firstFriday,
      time: "13:30",
      country: "us",
      currency: "USD",
      impact: "high",
      name: "Non-Farm Payrolls",
      forecast: "175K",
      previous: "187K"
    });
  }
  
  return events;
}
