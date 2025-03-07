
import * as cheerio from 'cheerio';
import { InvestingEvent } from '../../types';
import { extractDateTime } from './dateExtractor';
import { extractCurrency, extractEventName, extractImpact, extractValues } from './eventDetailsExtractor';
import { countImpacts, evaluateDataQuality } from './diagnostics';
import { ParseResult, ParserOptions } from './types';
import { findEventRows } from './rowFinder';

/**
 * Parses a single event row into an InvestingEvent object
 */
export function parseEventRow($: cheerio.CheerioAPI, row: any, year: number, month: number): InvestingEvent | null {
  try {
    const $row = $(row);
    
    // Extract date and time
    const { eventDate, timeStr } = extractDateTime($row, year, month);
    
    // Check if this event is in the requested month and year
    if (!eventDate || eventDate.getMonth() !== month || eventDate.getFullYear() !== year) {
      return null;
    }
    
    // Extract event ID
    const eventId = $row.attr('id') || `event-${Math.random().toString(36).substring(2, 10)}`;
    
    // Extract country/currency
    const currency = extractCurrency($row);
    
    // Extract event name
    const name = extractEventName($row);
    if (!name) return null; // Skip if no name
    
    // Extract importance/impact
    const impact = extractImpact($row);
    
    // Extract forecast, previous, and actual values
    const { forecast, previous, actual } = extractValues($row);
    
    // Create event object
    return {
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
  } catch (rowError) {
    console.warn("Error parsing row:", rowError);
    return null;
  }
}

/**
 * Main parsing function for the HTML content
 */
export function parseInvestingEvents(html: string, options: ParserOptions): ParseResult {
  const { year, month, verbose = false } = options;
  const events: InvestingEvent[] = [];
  const errors: string[] = [];
  
  try {
    if (verbose) console.log("Parsing Investing.com calendar HTML...");
    
    const $ = cheerio.load(html);
    
    // Find event rows
    const eventRows = findEventRows($);
    
    // Process each row
    eventRows.each((_, row) => {
      const event = parseEventRow($, row, year, month);
      if (event) {
        events.push(event);
      }
    });
    
    if (verbose) console.log(`Successfully parsed ${events.length} events`);
    
    // Data quality checks
    const dataQualityWarnings = evaluateDataQuality(events, html);
    errors.push(...dataQualityWarnings);
    
    // Impact distribution for diagnostics
    const impactDistribution = countImpacts(events);
    if (verbose) console.log('Impact distribution:', impactDistribution);
    
    return {
      events,
      diagnostics: {
        impactDistribution,
        eventCount: events.length,
        errors
      }
    };
  } catch (error) {
    const errorMsg = `Error parsing Investing.com HTML: ${error}`;
    console.error(errorMsg);
    errors.push(errorMsg);
    
    return {
      events: [],
      diagnostics: {
        impactDistribution: {},
        eventCount: 0,
        errors
      }
    };
  }
}
