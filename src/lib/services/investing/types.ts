
export interface InvestingEvent {
  id: string;
  date: Date;
  time: string;
  country: string;
  currency: string;
  impact: 'high' | 'medium' | 'low';
  name: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

// Used for mock data generation
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// For type compatibility with existing components
export type ForexEvent = InvestingEvent;

// Map country codes to currency codes
export const countryCurrencyMap: Record<string, string> = {
  'us': 'USD',
  'euro': 'EUR',
  'uk': 'GBP',
  'jp': 'JPY',
  'au': 'AUD',
  'ca': 'CAD',
  'ch': 'CHF',
  'cn': 'CNY',
  'nz': 'NZD',
  'sg': 'SGD',
  'hk': 'HKD',
  'kr': 'KRW',
  'in': 'INR',
  'br': 'BRL',
  'ru': 'RUB',
  'za': 'ZAR',
  'mx': 'MXN',
  'tw': 'TWD',
  'tr': 'TRY',
  'de': 'EUR',
  'fr': 'EUR',
  'it': 'EUR',
  'es': 'EUR',
  'eu': 'EUR',  // European Union
};

// Impact flag mapping
export const impactFlagMapping: Record<number, 'high' | 'medium' | 'low'> = {
  1: 'low',
  2: 'medium',
  3: 'high',
  // Default will be handled in code
};

// For generating mock data in case of failure
export const eventNames: Record<number, string> = {
  1: 'Interest Rate Decision',
  2: 'Non-Farm Payrolls',
  3: 'CPI m/m',
  4: 'GDP Growth Rate',
  5: 'Unemployment Rate',
  6: 'Retail Sales m/m',
  7: 'PMI Manufacturing',
  8: 'Trade Balance',
  9: 'Consumer Confidence',
  10: 'Industrial Production',
  // More event names...
};
