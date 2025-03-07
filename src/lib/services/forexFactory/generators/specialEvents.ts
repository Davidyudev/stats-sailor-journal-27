
import { ForexEvent } from '../types';

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
