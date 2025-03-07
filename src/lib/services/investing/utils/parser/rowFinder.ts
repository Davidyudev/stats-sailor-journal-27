
import * as cheerio from 'cheerio';

/**
 * Finds event rows in the HTML using multiple strategies
 */
export function findEventRows($: cheerio.CheerioAPI): cheerio.Cheerio<any> {
  // Try multiple selectors to find event rows (different page structures)
  const eventSelectors = [
    'tr.js-event-item',
    'tr.event_item',
    'tr[data-event-datetime]',
    'table.economicCalendarTable tr:not(.theDay)'
  ];
  
  // Try each selector in turn
  for (const selector of eventSelectors) {
    const rows = $(selector);
    if (rows.length > 0) {
      console.log(`Found ${rows.length} potential events using selector: ${selector}`);
      return rows;
    }
  }
  
  // If we still don't have events, try a more generic approach
  const fallbackRows = $('table tr').filter(function() {
    const $el = $(this);
    // Look for rows with multiple cells and some data attributes
    return $el.find('td').length >= 4 && 
           (!!$el.attr('data-event-datetime') || 
            $el.find('td[data-real-value]').length > 0);
  });
  
  console.log(`Fallback: Found ${fallbackRows.length} potential events`);
  return fallbackRows;
}
