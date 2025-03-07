
// Format time from 24h to AM/PM
export function formatTimeToAMPM(time: string): string {
  if (time === "All Day" || !time || time === "") return "All Day";
  
  // Handle common time formats from Forex Factory
  if (time.includes('am') || time.includes('pm')) {
    // Already in AM/PM format
    return time.toUpperCase().replace('AM', ' AM').replace('PM', ' PM').trim();
  }
  
  // Try to parse 24-hour format
  const timeMatch = time.match(/(\d{1,2}):?(\d{2})/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    const hrs = parseInt(hours);
    const period = hrs >= 12 ? 'PM' : 'AM';
    const formattedHours = hrs % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHours}:${minutes} ${period}`;
  }
  
  return time; // Return original if we can't parse it
}
