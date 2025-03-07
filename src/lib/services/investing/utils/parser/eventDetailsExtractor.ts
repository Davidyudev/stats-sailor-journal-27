
import * as cheerio from 'cheerio';
import { countryCurrencyMap } from '../../types';

/**
 * Extracts currency and country information from an event row
 */
export function extractCurrency($row: cheerio.Cheerio<any>): string {
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
  
  return currency;
}

/**
 * Extracts event name from an event row
 */
export function extractEventName($row: cheerio.Cheerio<any>): string {
  const nameCell = $row.find('td.event, td.eventName, td:nth-child(4)');
  return nameCell.text().trim();
}

/**
 * Extracts impact level from an event row
 */
export function extractImpact($row: cheerio.Cheerio<any>): 'high' | 'medium' | 'low' {
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
  
  return impact;
}

/**
 * Extracts forecast, previous, and actual values from an event row
 */
export function extractValues($row: cheerio.Cheerio<any>): {
  forecast: string;
  previous: string;
  actual: string;
} {
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
  
  return { forecast, previous, actual };
}
