
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
          // Enhanced date extraction - look for day number pattern
          const dayMatch = dateText.match(/(\d{1,2})/);
          if (dayMatch) {
            const day = parseInt(dayMatch[1]);
            // Create date with provided year and month
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
  
  // Method 3: If the above methods failed, try parsing from any date string in the row
  if (!eventDate) {
    try {
      // Look for date patterns like "Mar 7", "7 Mar", etc.
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthPattern = monthNames.join("|");
      const datePattern = new RegExp(`(${monthPattern})\\s+(\\d{1,2})|(\\d{1,2})\\s+(${monthPattern})`, 'i');
      
      const rowText = $row.text();
      const dateMatch = rowText.match(datePattern);
      
      if (dateMatch) {
        // Check which pattern matched
        let day, monthStr;
        if (dateMatch[1] && dateMatch[2]) {
          // Format: "Mar 7"
          monthStr = dateMatch[1];
          day = parseInt(dateMatch[2]);
        } else if (dateMatch[3] && dateMatch[4]) {
          // Format: "7 Mar"
          day = parseInt(dateMatch[3]);
          monthStr = dateMatch[4];
        }
        
        if (day) {
          // We use the provided year and month instead of the matched month
          // This is because we're fetching events for a specific month
          eventDate = new Date(year, month, day);
        }
      }
    } catch (e) {
      console.warn("Error in fallback date extraction:", e);
    }
  }
  
  // If we still couldn't get a date, use placeholder date based on provided month
  if (!eventDate) {
    // Use the 1st day of the month as a fallback, will be filtered later if needed
    eventDate = new Date(year, month, 1);
    console.warn("Could not extract exact date for event, using placeholder date");
  }
  
  return { eventDate, timeStr };
}
