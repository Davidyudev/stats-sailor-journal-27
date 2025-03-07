
import * as cheerio from 'cheerio';

/**
 * Extracts date and time information from an event row
 */
export function extractDateTime($row: cheerio.Cheerio<any>, year: number, month: number): {
  eventDate: Date | null;
  timeStr: string;
} {
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
  
  return { eventDate, timeStr };
}
