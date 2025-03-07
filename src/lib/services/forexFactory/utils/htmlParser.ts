import { ForexEvent } from '../types';

// Extract calendar data from the Forex Factory page
export function extractCalendarData(html: string, year: number, month: number): ForexEvent[] {
  try {
    // First try to get calendar data from embedded JSON
    let events = extractFromEmbeddedJSON(html, year, month);
    
    // If that fails, try direct HTML extraction
    if (events.length === 0) {
      events = extractFromHTMLDirectly(html, year, month);
    }
    
    return events;
  } catch (error) {
    console.error('Error extracting calendar data:', error);
    return [];
  }
}

// Extract data from embedded JSON in page
function extractFromEmbeddedJSON(html: string, year: number, month: number): ForexEvent[] {
  try {
    // Look for different possible JSON patterns
    const patterns = [
      /window\.calendarComponentStates\[\d+\]\s*=\s*({[\s\S]*?days:.*?\[.*?\].*?});/,
      /var\s+calendarJson\s*=\s*({[\s\S]*?days:.*?\[.*?\].*?});/,
      /"calendar":\s*({[\s\S]*?days:.*?\[.*?\].*?})/
    ];
    
    let calendarData = null;
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          // Clean JSON string
          const jsonText = match[1].replace(/\\'/g, "'")
                                  .replace(/\\"/g, '"')
                                  .replace(/new Date\([^)]+\)/g, '"__date__"')
                                  .replace(/,\s*}/g, '}')
                                  .replace(/,\s*]/g, ']');
                                  
          calendarData = JSON.parse(jsonText, (key, value) => {
            if (value === "__date__") return null;
            return value;
          });
          
          if (calendarData && calendarData.days) {
            break; // Successfully extracted data
          }
        } catch (e) {
          console.warn('Failed to parse with pattern, trying next:', e);
        }
      }
    }
    
    if (!calendarData || !calendarData.days) {
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
  
  calendarData.days.forEach((day: any) => {
    if (!day.events || !Array.isArray(day.events)) {
      return;
    }
    
    // Handle different date formats
    let dateObj: Date;
    if (day.dateline) {
      // Unix timestamp (in seconds)
      const dayTimestamp = day.dateline * 1000;
      dateObj = new Date(dayTimestamp);
    } else if (day.date) {
      // ISO string or date string
      dateObj = new Date(day.date);
    } else {
      // Skip days without proper date
      return;
    }
    
    day.events.forEach((event: any) => {
      if (!event.currency || !event.name) {
        return;
      }
      
      let impact: 'high' | 'medium' | 'low' = 'low';
      
      if (event.impactClass) {
        if (event.impactClass.includes('red') || 
            event.impactTitle?.includes('High Impact')) {
          impact = 'high';
        } else if (event.impactClass.includes('orange') || 
                  event.impactClass.includes('yel') || 
                  event.impactTitle?.includes('Medium Impact')) {
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
        impact: impact,
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

// Helper to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
