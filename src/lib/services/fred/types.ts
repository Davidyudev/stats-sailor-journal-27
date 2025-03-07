
export interface FredRelease {
  id: number;
  name: string;
  press_release?: boolean;
  link?: string;
}

export interface FredReleaseDate {
  release_id: number;
  date: string; // ISO date format
  name?: string;
}

export interface FredEvent {
  id: string;
  date: Date;
  time: string;
  name: string;
  impact: 'high' | 'medium' | 'low';
  currency: string; // We'll default to "USD" for most FRED data
  forecast?: string;
  previous?: string;
  actual?: string;
}

// Mapping of release IDs to impact levels
export const RELEASE_IMPACT_MAP: Record<number, 'high' | 'medium' | 'low'> = {
  // High impact releases
  9: 'high',      // GDP
  10: 'high',     // Personal Income and Outlays
  15: 'high',     // Consumer Price Index
  21: 'high',     // Employment Situation (NFP)
  50: 'high',     // FOMC Meeting
  53: 'high',     // FOMC Minutes
  311: 'high',    // Retail Sales
  
  // Medium impact releases
  11: 'medium',   // Industrial Production and Capacity Utilization
  13: 'medium',   // Manufacturer's Shipments, Inventories, and Orders
  17: 'medium',   // Housing Starts
  18: 'medium',   // Producer Price Index
  22: 'medium',   // Manufacturing Business Outlook Survey
  33: 'medium',   // ISM Manufacturing Report on Business
  81: 'medium',   // Construction Spending
  85: 'medium',   // Job Openings and Labor Turnover Survey
  
  // Default to low impact for other releases
  default: 'low'
};

// List of currencies by release ID (mostly "USD" but can be expanded)
export const RELEASE_CURRENCY_MAP: Record<number, string> = {
  default: 'USD'
};
