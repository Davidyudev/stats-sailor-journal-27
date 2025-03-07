
import { InvestingEvent, countryCurrencyMap, impactFlagMapping } from '../types';
import * as cheerio from 'cheerio';

// Main parsing function - made more robust to handle different HTML structures
export function parseInvestingCalendarHTML(html: string, year: number, month: number): InvestingEvent[] {
  try {
    console.log("Parsing Investing.com calendar HTML...");
    
    const $ = cheerio.load(html);
    const events: InvestingEvent[] = [];
    
    // Try multiple selectors to find event rows (different page structures)
    const eventSelectors = [
      'tr.js-event-item',
      'tr.event_item',
      'tr[data-event-datetime]',
      'table.economicCalendarTable tr:not(.theDay)'
    ];
    
    let eventRows: cheerio.Cheerio<cheerio.Element>;
    for (const selector of eventSelectors) {
      eventRows = $(selector);
      if (eventRows.length > 0) {
        console.log(`Found ${eventRows.length} potential events using selector: ${selector}`);
        break;
      }
    }
    
    // If we still don't have events, try a more generic approach
    if (!eventRows || eventRows.length === 0) {
      // Try to find any table rows that might contain event data
      eventRows = $('table tr').filter(function(this: cheerio.Element, _, el) {
        const $el = $(el);
        // Look for rows with multiple cells and some data attributes
        return $el.find('td').length >= 4 && 
               (!!$el.attr('data-event-datetime') || 
                $el.find('td[data-real-value]').length > 0);
      });
      console.log(`Fallback: Found ${eventRows.length} potential events`);
    }
    
    // Process each row
    eventRows.each((_, row) => {
      try {
        const $row = $(row);
        
        // Try multiple ways to extract date
        let eventDate: Date | null = null;
        let timeStr = "All Day";
        
        // Method 1: From data attribute
        const dateTimeStr = $row.attr('data-event-datetime') || $row.find('[data-event-datetime]').attr('data-event-datetime');
        if (dateTimeStr) {
          try {
            eventDate = new Date(dateTimeStr);
            timeStr = eventDate.toTimeString().substring(0, 5); // HH:MM format
          } catch (e) {
            console.warn("Error parsing date from attribute:", e);
          }
        }
        
        // Method 2: From cell content
        if (!eventDate) {
          const dateCell = $row.find('td.time') || $row.find('td:first-child');
          if (dateCell.length) {
            const dateText = dateCell.text().trim();
            if (dateText) {
              // Various date formats in the table
              try {
                // Assuming format like "Mar 14, 2025" or "14 Mar"
                // We already know the year and month from the function parameters
                const dayMatch = dateText.match(/(\d{1,2})/);
                if (dayMatch) {
                  const day = parseInt(dayMatch[1]);
                  eventDate = new Date(year, month, day);
                  
                  // Try to extract time
                  const timeMatch = dateText.match(/(\d{1,2}):(\d{2})/);
                  if (timeMatch) {
                    timeStr = timeMatch[0];
                  }
                }
              } catch (e) {
                console.warn("Error parsing date from text:", e);
              }
            }
          }
        }
        
        // If we still couldn't get a date, use current date (not ideal but better than nothing)
        if (!eventDate) {
          console.warn("Could not extract date for event, using current date");
          eventDate = new Date();
        }
        
        // Check if this event is in the requested month and year
        if (eventDate.getMonth() !== month || eventDate.getFullYear() !== year) {
          return;
        }
        
        // Extract event ID
        const eventId = $row.attr('id') || `event-${Math.random().toString(36).substring(2, 10)}`;
        
        // Extract country/currency using multiple possible selectors
        let currency = '';
        const countryCell = $row.find('td.flagCur, td.country, td:has(span.flag)');
        
        if (countryCell.length) {
          // Try to get country code from span title
          const countryCode = (countryCell.find('span').attr('title') || '').toLowerCase();
          
          if (countryCode) {
            // Map country code to currency code
            currency = countryCurrencyMap[countryCode] || countryCode.toUpperCase();
          }
          
          // If we couldn't get from title, try from text content
          if (!currency) {
            const currencyText = countryCell.text().trim();
            if (currencyText && currencyText.length <= 3) {
              currency = currencyText.toUpperCase();
            }
          }
        }
        
        // Fallback for currency if not found
        if (!currency) {
          // Try to extract from class names
          const classes = $row.attr('class') || '';
          const currencyMatch = classes.match(/cc_([A-Z]{3})/);
          if (currencyMatch) {
            currency = currencyMatch[1];
          } else {
            // Default to USD if we can't determine
            currency = 'USD';
          }
        }
        
        // Extract event name
        const nameCell = $row.find('td.event, td.eventName, td:nth-child(4)');
        const name = nameCell.text().trim();
        if (!name) return; // Skip if no name
        
        // Extract importance/impact
        let impact: 'high' | 'medium' | 'low' = 'low';
        
        // Try multiple methods to determine impact
        // Method 1: Look for bull icons
        const impactCell = $row.find('td.sentiment, td.bull, td:has(i.grayFullBullishIcon)');
        if (impactCell.length) {
          const bullCount = impactCell.find('i.grayFullBullishIcon, i.redFullBullishIcon, i.bullIcon').length;
          
          if (bullCount >= 3) {
            impact = 'high';
          } else if (bullCount >= 2) {
            impact = 'medium';
          }
        }
        
        // Method 2: Look for impact classes or attributes
        if (impact === 'low') {
          const impactAttr = $row.attr('data-importance') || '';
          if (impactAttr.includes('3')) impact = 'high';
          else if (impactAttr.includes('2')) impact = 'medium';
          
          // Also check for color classes
          const rowClasses = $row.attr('class') || '';
          if (rowClasses.includes('redBg') || rowClasses.includes('high')) impact = 'high';
          else if (rowClasses.includes('orangeBg') || rowClasses.includes('medium')) impact = 'medium';
        }
        
        // Extract forecast, previous, and actual values from various possible locations
        let forecast = '';
        let previous = '';
        let actual = '';
        
        // Try different selectors for these values
        const forecastCell = $row.find('td.forecast, td:contains("Forecast")').next();
        const previousCell = $row.find('td.prev, td.previous, td:contains("Previous")').next();
        const actualCell = $row.find('td.act, td.actual, td:contains("Actual")').next();
        
        if (forecastCell.length) forecast = forecastCell.text().trim();
        if (previousCell.length) previous = previousCell.text().trim();
        if (actualCell.length) actual = actualCell.text().trim();
        
        // If we couldn't find with selectors, try looking for data attributes
        if (!forecast) {
          const forecastAttr = $row.find('[data-forecast]').attr('data-forecast');
          if (forecastAttr) forecast = forecastAttr;
        }
        
        if (!previous) {
          const previousAttr = $row.find('[data-previous]').attr('data-previous');
          if (previousAttr) previous = previousAttr;
        }
        
        if (!actual) {
          const actualAttr = $row.find('[data-actual]').attr('data-actual');
          if (actualAttr) actual = actualAttr;
        }
        
        // Create event object
        const event: InvestingEvent = {
          id: eventId,
          date: eventDate,
          time: timeStr,
          country: currency.toLowerCase(),
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
    
    // If we have a suspiciously low number of events, let's check
    if (events.length < 5) {
      console.warn('Very few events parsed, HTML parsing may have failed');
      // Log some diagnostic info
      console.log('HTML snippet:', html.substring(0, 500));
    }
    
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
