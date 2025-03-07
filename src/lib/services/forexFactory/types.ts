
// Types for the ForexFactory service
export interface ForexEvent {
  date: Date;
  time: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  name: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface EventGenerationOptions {
  year: number;
  month: number;
  random: SeededRandom;
}

export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // Generate a random number between 0 and 1 (similar to Math.random())
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Generate a random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Generate a random floating point number between min and max
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Return a random element from an array
  choose<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  // Return true with the given probability (0-1)
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

// Export event name collections for reuse
export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY'];

export const HIGH_IMPACT_EVENTS = [
  'Interest Rate Decision', 
  'Non-Farm Payrolls', 
  'CPI m/m', 
  'GDP q/q', 
  'Unemployment Rate',
  'FOMC Statement',
  'Federal Funds Rate',
  'Core PCE Price Index m/m',
  'ECB Press Conference',
  'BOE Inflation Report',
  'Employment Change',
  'President Speaks',
  'Prelim GDP q/q',
  'German Prelim CPI m/m',
  'ISM Manufacturing PMI'
];

export const MEDIUM_IMPACT_EVENTS = [
  'Retail Sales m/m',
  'Manufacturing PMI',
  'Services PMI',
  'Trade Balance',
  'Industrial Production m/m',
  'Chicago PMI',
  'Building Permits',
  'Housing Starts',
  'Prelim UoM Consumer Sentiment',
  'Factory Orders m/m',
  'Durable Goods Orders m/m',
  'Private Sector Credit m/m',
  'Wholesale Inventories m/m',
  'Consumer Spending m/m',
  'Retail Sales y/y',
  'KOF Economic Barometer'
];

export const LOW_IMPACT_EVENTS = [
  'Housing Starts',
  'Building Permits',
  'Consumer Confidence',
  'Existing Home Sales',
  'Pending Home Sales',
  'API Weekly Crude Oil Stock',
  'Crude Oil Inventories',
  'Natural Gas Storage',
  'Import Prices m/m',
  'JOLTS Job Openings',
  'Flash Services PMI',
  'Flash Manufacturing PMI',
  'German Import Prices m/m',
  'German Retail Sales m/m',
  'Nationwide HPI m/m',
  'MPC Member Speaks',
  'French Consumer Spending m/m',
  'French Final Private Payrolls q/q',
  'French Prelim CPI m/m',
  'French Prelim GDP q/q',
  'Italian Prelim CPI m/m',
  'German Unemployment Change'
];
