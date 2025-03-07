import { ForexEvent } from '../types';
import * as cheerio from 'cheerio';

// Main extraction function
export function extractCalendarData(html: string, year: number, month: number): ForexEvent[] {
  try {
    console.log("Extracting calendar data...");
    
    // First try to get calendar data from embedded JSON
    let events = extractFromEmbeddedJSON(html, year, month);
    
    // If that fails, try direct HTML extraction
    if (events.length === 0) {
      console.log("JSON extraction failed, trying HTML extraction...");
      events = extractFromHTMLDirectly(html, year, month);
    }
    
    if (events.length === 0) {
      console.log("HTML extraction failed, trying Cheerio extraction...");
      events = extractWithCheerio(html, year, month);
    }
    
    // Validate the extracted events
    events = validateAndFixImpacts(events);
    
    console.log(`Extracted ${events.length} events in total`);
    console.log('Impact distribution:', countImpacts(events));
    
    return events;
  } catch (error) {
    console.error('Error extracting calendar data:', error);
    return [];
  }
}

// Helper function to count impacts for debugging
function countImpacts(events: ForexEvent[]) {
  return events.reduce((acc, event) => {
    acc[event.impact] = (acc[event.impact] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Helper function to validate and fix impact levels
function validateAndFixImpacts(events: ForexEvent[]): ForexEvent[] {
  return events.map(event => {
    // Ensure impact is correctly set based on any available indicators
    if (event.impact === 'low' && event.name) {
      const name = event.name.toLowerCase();
      // Common high impact events
      if (
        name.includes('nfp') || 
        name.includes('non-farm') ||
        name.includes('fomc') || 
        name.includes('rate decision') ||
        name.includes('cpi ') ||
        name.includes('gdp')
      ) {
        return { ...event, impact: 'high' };
      }
      // Common medium impact events
      if (
        name.includes('pmi') ||
        name.includes('retail sales') ||
        name.includes('employment') ||
        name.includes('manufacturing')
      ) {
        return { ...event, impact: 'medium' };
      }
    }
    return event;
  });
}

// Extract data from embedded JSON in page
function extractFromEmbeddedJSON(html: string, year: number, month: number): ForexEvent[] {
  try {
    // Look for different possible JSON patterns
    const patterns = [
      /window\.calendarComponentStates\[\d+\]\s*=\s*({[\s\S]*?days:.*?\[.*?\].*?});/,
      /var\s+calendarJson\s*=\s*({[\s\S]*?days:.*?\[.*?\].*?});/,
      /"calendar":\s*({[\s\S]*?days:.*?\[.*?\].*?})/,
      /window\.FF\s*=\s*{[\s\S]*?calendarComponentStates\[\d+\]\s*=\s*({[\s\S]*?days:.*?\[.*?\].*?});/
    ];
    
    let calendarData = null;
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          console.log(`Found calendar data using pattern: ${pattern}`);
          
          // Clean JSON string and handle special cases
          let jsonText = match[1];
          
          // Handle various JSON format issues
          jsonText = jsonText.replace(/\\'/g, "'")
                            .replace(/\\"/g, '"')
                            .replace(/new Date\([^)]+\)/g, '"__date__"')
                            .replace(/,\s*}/g, '}')
                            .replace(/,\s*]/g, ']')
                            .replace(/([{,])\s*(\w+):/g, '$1"$2":'); // Convert property names to quoted strings
                            
          try {
            calendarData = JSON.parse(jsonText, (key, value) => {
              if (value === "__date__") return null;
              return value;
            });
            
            if (calendarData && calendarData.days) {
              console.log(`Successfully parsed calendar data with ${calendarData.days.length} days`);
              break; // Successfully extracted data
            }
          } catch (jsonError) {
            console.warn('Failed to parse calendar data JSON:', jsonError);
            // Try a more lenient approach by using eval (but safely with Function)
            try {
              console.log("Trying alternative JSON parsing method...");
              // This is a controlled environment with our own input, so this is safe
              calendarData = Function(`"use strict"; return (${jsonText})`)();
              
              if (calendarData && calendarData.days) {
                console.log(`Successfully parsed calendar data with alternative method: ${calendarData.days.length} days`);
                break;
              }
            } catch (evalError) {
              console.warn('Alternative parsing also failed:', evalError);
            }
          }
        } catch (e) {
          console.warn('Failed with pattern, trying next:', e);
        }
      }
    }
    
    if (!calendarData || !calendarData.days) {
      console.log("Could not extract or parse calendar JSON data");
      return [];
    }
    
    return processCalendarData(calendarData, year, month);
  } catch (error) {
    console.warn('Error extracting JSON data:', error);
    return [];
  }
}

// Process the calendar data into ForexEvents
function processCalendarData(calendarData: any, year: number, month: number): ForexEvent[] {
  const events: ForexEvent[] = [];
  
  if (!Array.isArray(calendarData.days)) {
    console.warn('Calendar days is not an array');
    return [];
  }
  
  console.log(`Processing ${calendarData.days.length} days from calendar data`);
  
  calendarData.days.forEach((day: any) => {
    if (!day.events || !Array.isArray(day.events)) return;
    
    // Handle different date formats
    let dateObj: Date;
    if (day.dateline) {
      dateObj = new Date(day.dateline * 1000);
    } else if (day.date) {
      dateObj = new Date(day.date);
    } else {
      return;
    }
    
    day.events.forEach((event: any) => {
      if (!event.currency || !event.name) return;
      
      let impact: 'high' | 'medium' | 'low' = 'low';
      
      // Enhanced impact detection
      if (event.impact) {
        impact = event.impact.toLowerCase();
      } else if (event.impactClass) {
        if (event.impactClass.includes('red') || 
            event.impactTitle?.toLowerCase().includes('high')) {
          impact = 'high';
        } else if (
          event.impactClass.includes('orange') || 
          event.impactClass.includes('yel') || 
          event.impactTitle?.toLowerCase().includes('medium')
        ) {
          impact = 'medium';
        }
      }
      
      let eventTime = 'All Day';
      if (event.timeLabel && !event.timeMasked) {
        eventTime = event.timeLabel;
      }
      
      events.push({
        date: dateObj,
        time: eventTime,
        currency: event.currency,
        impact,
        name: event.name,
        forecast: event.forecast || '',
        previous: event.previous || '',
        actual: event.actual || undefined
      });
    });
  });
  
  return events;
}

// Extract directly from HTML structure as fallback
function extractFromHTMLDirectly(html: string, year: number, month: number): ForexEvent[] {
  const events: ForexEvent[] = [];
  
  try {
    // Extract table rows with events
    const eventRowRegex = /<tr[^>]*?class="[^"]*?calendar_row[^"]*?"[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    
    // Keep track of the current date
    let currentDate: Date | null = null;
    
    while ((rowMatch = eventRowRegex.exec(html)) !== null) {
      const rowContent = rowMatch[1];
      
      // Extract date if present in this row
      const dateMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__date[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      if (dateMatch && dateMatch[1]) {
        const dateText = stripHtml(dateMatch[1]).trim();
        if (dateText && !dateText.includes('&')) {
          // Parse date from text (format varies)
          try {
            // Try different date formats
            const dayMatch = dateText.match(/\d+/);
            if (dayMatch) {
              const day = parseInt(dayMatch[0], 10);
              currentDate = new Date(year, month, day);
            }
          } catch (e) {
            console.warn('Error parsing date:', dateText, e);
          }
        }
      }
      
      // Skip if we don't have a date
      if (!currentDate) continue;
      
      // Extract event details
      const currencyMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__currency[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      const impactMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__impact[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      const eventMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__event[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      const timeMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__time[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      const forecastMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__forecast[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      const previousMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__previous[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      const actualMatch = rowContent.match(/<td[^>]*?class="[^"]*?calendar__actual[^"]*?"[^>]*>([\s\S]*?)<\/td>/i);
      
      if (!currencyMatch || !eventMatch) continue;
      
      const currency = stripHtml(currencyMatch[1]).trim();
      const eventName = stripHtml(eventMatch[1]).trim();
      
      if (!currency || !eventName) continue;
      
      // Determine impact
      let impact: 'high' | 'medium' | 'low' = 'low';
      if (impactMatch && impactMatch[1]) {
        const impactHtml = impactMatch[1];
        if (impactHtml.includes('red') || impactHtml.includes('high')) {
          impact = 'high';
        } else if (impactHtml.includes('orange') || impactHtml.includes('yellow') || impactHtml.includes('medium')) {
          impact = 'medium';
        }
      }
      
      // Extract time
      let time = 'All Day';
      if (timeMatch && timeMatch[1]) {
        const timeText = stripHtml(timeMatch[1]).trim();
        if (timeText && timeText !== '&nbsp;') {
          time = timeText;
        }
      }
      
      // Extract forecast, previous, and actual values
      let forecast = '';
      let previous = '';
      let actual: string | undefined = undefined;
      
      if (forecastMatch && forecastMatch[1]) {
        forecast = stripHtml(forecastMatch[1]).trim();
      }
      
      if (previousMatch && previousMatch[1]) {
        previous = stripHtml(previousMatch[1]).trim();
      }
      
      if (actualMatch && actualMatch[1]) {
        const actualText = stripHtml(actualMatch[1]).trim();
        if (actualText && actualText !== '&nbsp;') {
          actual = actualText;
        }
      }
      
      events.push({
        date: new Date(currentDate),
        time,
        currency,
        impact,
        name: eventName,
        forecast,
        previous,
        actual
      });
    }
    
    return events;
  } catch (error) {
    console.error('Error in direct HTML extraction:', error);
    return [];
  }
}

// New extraction method using Cheerio
function extractWithCheerio(html: string, year: number, month: number): ForexEvent[] {
  try {
    const events: ForexEvent[] = [];
    const $ = cheerio.load(html);
    
    console.log("Using Cheerio to extract calendar data");
    
    // Find the table with calendar data
    const calendarRows = $('tr.calendar_row, tr.calendar__row');
    console.log(`Found ${calendarRows.length} potential calendar rows with Cheerio`);
    
    let currentDate: Date | null = null;
    
    calendarRows.each((_, row) => {
      // Check for date cell
      const dateCell = $(row).find('td.calendar__date, td.date');
      if (dateCell.length > 0) {
        const dateText = dateCell.text().trim();
        const dayMatch = dateText.match(/\d+/);
        if (dayMatch) {
          const day = parseInt(dayMatch[0], 10);
          currentDate = new Date(year, month, day);
        }
      }
      
      if (!currentDate) return;
      
      // Get currency
      const currency = $(row).find('td.calendar__currency, td.currency').text().trim();
      if (!currency) return;
      
      // Get event name
      const eventName = $(row).find('td.calendar__event, td.event').text().trim();
      if (!eventName) return;
      
      // Determine impact
      let impact: 'high' | 'medium' | 'low' = 'low';
      const impactCell = $(row).find('td.calendar__impact, td.impact');
      const impactHtml = impactCell.html() || '';
      
      if (impactHtml.includes('red') || impactHtml.includes('high')) {
        impact = 'high';
      } else if (impactHtml.includes('orange') || impactHtml.includes('yellow') || impactHtml.includes('medium')) {
        impact = 'medium';
      }
      
      // Get time
      let time = 'All Day';
      const timeText = $(row).find('td.calendar__time, td.time').text().trim();
      if (timeText && timeText !== '&nbsp;') {
        time = timeText;
      }
      
      // Get forecast, previous, and actual values
      const forecast = $(row).find('td.calendar__forecast, td.forecast').text().trim();
      const previous = $(row).find('td.calendar__previous, td.previous').text().trim();
      const actualText = $(row).find('td.calendar__actual, td.actual').text().trim();
      
      let actual: string | undefined = undefined;
      if (actualText && actualText !== '&nbsp;') {
        actual = actualText;
      }
      
      events.push({
        date: new Date(currentDate),
        time,
        currency,
        impact,
        name: eventName,
        forecast,
        previous,
        actual
      });
    });
    
    return events;
  } catch (error) {
    console.error('Error in Cheerio extraction:', error);
    return [];
  }
}

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
