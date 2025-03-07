
import { InvestingEvent, countryCurrencyMap, impactFlagMapping } from '../types';
import * as cheerio from 'cheerio';

// Main parsing function
export function parseInvestingCalendarHTML(html: string, year: number, month: number): InvestingEvent[] {
  try {
    console.log("Parsing Investing.com calendar HTML...");
    
    const $ = cheerio.load(html);
    const events: InvestingEvent[] = [];
    
    // Event rows have a specific class
    const eventRows = $('tr.js-event-item');
    console.log(`Found ${eventRows.length} potential events in HTML`);
    
    eventRows.each((_, row) => {
      try {
        const $row = $(row);
        
        // Extract date from the row's data-event-datetime attribute
        const dateTimeStr = $row.attr('data-event-datetime');
        if (!dateTimeStr) return;
        
        // Extract event ID
        const eventId = $row.attr('id') || `event-${Math.random().toString(36).substring(2, 10)}`;
        
        // Parse date and time
        let eventDate: Date;
        let timeStr = "All Day";
        
        try {
          const dateTime = new Date(dateTimeStr);
          
          // Check if this event is in the requested month and year
          if (dateTime.getMonth() !== month || dateTime.getFullYear() !== year) {
            return;
          }
          
          eventDate = dateTime;
          timeStr = dateTime.toTimeString().substring(0, 5); // HH:MM format
        } catch (e) {
          console.warn("Error parsing date:", e);
          return; // Skip this event if date parsing fails
        }
        
        // Extract country/currency
        const countryCell = $row.find('td.flagCur');
        const countryCode = (countryCell.find('span').attr('title') || '').toLowerCase();
        
        // Map country code to currency code
        const currency = countryCurrencyMap[countryCode] || countryCode.toUpperCase();
        
        // Extract event name
        const nameCell = $row.find('td.event');
        const name = nameCell.text().trim();
        if (!name) return; // Skip if no name
        
        // Extract importance/impact
        const impactCell = $row.find('td.sentiment');
        let impact: 'high' | 'medium' | 'low' = 'low';
        
        // Check bull icons to determine impact level
        const bullCount = impactCell.find('i.grayFullBullishIcon, i.redFullBullishIcon').length;
        if (bullCount >= 3) {
          impact = 'high';
        } else if (bullCount >= 2) {
          impact = 'medium';
        }
        
        // Extract forecast, previous, and actual values
        const forecastCell = $row.find('td.forecast');
        const previousCell = $row.find('td.prev');
        const actualCell = $row.find('td.act');
        
        const forecast = forecastCell.text().trim();
        const previous = previousCell.text().trim();
        const actual = actualCell.text().trim();
        
        // Create event object
        const event: InvestingEvent = {
          id: eventId,
          date: eventDate,
          time: timeStr,
          country: countryCode,
          currency,
          impact,
          name,
          forecast: forecast !== "" ? forecast : undefined,
          previous: previous !== "" ? previous : undefined,
          actual: actual !== "" ? actual : undefined
        };
        
        events.push(event);
      } catch (rowError) {
        console.warn("Error parsing row:", rowError);
      }
    });
    
    console.log(`Successfully parsed ${events.length} events`);
    
    // Verify data quality
    console.log('Impact distribution:', countImpacts(events));
    
    return events;
  } catch (error) {
    console.error('Error parsing Investing.com HTML:', error);
    return [];
  }
}

// Helper function to count impacts for debugging
function countImpacts(events: InvestingEvent[]) {
  return events.reduce((acc, event) => {
    acc[event.impact] = (acc[event.impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
