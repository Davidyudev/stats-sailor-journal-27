
import * as cheerio from 'cheerio';
import { InvestingEvent } from '../../types';
import { ParseResult, ParserOptions } from './types';
import { findEventRows } from './rowFinder';
import { parseEventRow } from './singleEventParser';
import { countImpacts, evaluateDataQuality } from './diagnostics';

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
    if (verbose) console.log(`Found ${eventRows.length} potential event rows in HTML`);
    
    // Process each row
    let successCount = 0;
    let filteredOutCount = 0;
    
    eventRows.each((_, row) => {
      const event = parseEventRow($, row, year, month);
      if (event) {
        events.push(event);
        successCount++;
      } else {
        filteredOutCount++;
      }
    });
    
    if (verbose) {
      console.log(`Successfully parsed ${events.length} events (${successCount} valid events, ${filteredOutCount} filtered out)`);
      
      // Log distribution of events by day to help diagnose date issues
      const eventsByDay = events.reduce((acc, event) => {
        const day = event.date.getDate();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      console.log('Events distribution by day:');
      Object.entries(eventsByDay)
        .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
        .forEach(([day, count]) => {
          console.log(`- Day ${day}: ${count} events`);
        });
    }
    
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
