
import { ForexEvent } from '../types';

// Extract calendar data from the Forex Factory page
export function extractCalendarData(html: string, year: number, month: number): ForexEvent[] {
  try {
    // Look for the embedded calendar data
    const calendarStateRegex = /window\.calendarComponentStates\[\d+\]\s*=\s*({[\s\S]*?days:.*?\[.*?\].*?});/;
    const match = html.match(calendarStateRegex);
    
    if (!match || !match[1]) {
      console.error('Could not find calendar data in the HTML');
      return [];
    }
    
    // Extract and parse the JSON data safely
    let calendarData;
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
    } catch (e) {
      console.error('Error parsing calendar JSON data:', e);
      return extractDaysDirectly(html, year, month);
    }
    
    if (!calendarData || !calendarData.days) {
      console.error('Invalid calendar data structure');
      return [];
    }
    
    return processCalendarData(calendarData, year, month);
  } catch (error) {
    console.error('Error extracting calendar data:', error);
    return [];
  }
}

// Process the calendar data into ForexEvents
function processCalendarData(calendarData: any, year: number, month: number): ForexEvent[] {
  const events: ForexEvent[] = [];
  
  calendarData.days.forEach((day: any) => {
    if (!day.events || !Array.isArray(day.events)) {
      return;
    }
    
    const dayTimestamp = day.dateline * 1000;
    const dateObj = new Date(dayTimestamp);
    
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

// Fallback method to extract days directly from HTML
export function extractDaysDirectly(html: string, year: number, month: number): ForexEvent[] {
  const events: ForexEvent[] = [];
  const dayBlockRegex = /"date":"[^"]+","dateline":(\d+),"[^"]*","events":\[([^\]]+)\]/g;
  let match;
  
  while ((match = dayBlockRegex.exec(html)) !== null) {
    const dayTimestamp = parseInt(match[1]) * 1000;
    const dateObj = new Date(dayTimestamp);
    
    const eventsString = match[2];
    const eventMatches = eventsString.matchAll(/{[^}]+}/g);
    
    for (const eventMatch of eventMatches) {
      try {
        const eventStr = eventMatch[0]
          .replace(/([{,])(\s*)([a-zA-Z0-9_]+)(\s*):/g, '$1"$3":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');
        
        const event = JSON.parse(eventStr);
        
        if (!event.currency || !event.name) continue;
        
        let impact: 'high' | 'medium' | 'low' = 'low';
        if (event.impactClass) {
          if (event.impactClass.includes('red') || 
              (event.impactTitle && event.impactTitle.includes('High'))) {
            impact = 'high';
          } else if (event.impactClass.includes('orange') || 
                     event.impactClass.includes('yel') || 
                     (event.impactTitle && event.impactTitle.includes('Medium'))) {
            impact = 'medium';
          }
        }
        
        const timeText = event.timeLabel?.trim() || 'All Day';
        
        events.push({
          date: dateObj,
          time: timeText,
          currency: event.currency,
          impact: impact,
          name: event.name,
          forecast: event.forecast || '',
          previous: event.previous || '',
          actual: event.actual || undefined
        });
      } catch (e) {
        console.error('Error parsing individual event:', e);
      }
    }
  }
  
  return events;
}
