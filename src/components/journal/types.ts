
import { DateRange } from 'react-day-picker';

export type TimePeriod = 'all' | '1m' | '3m' | '6m' | '1y' | 'this-month' | 'this-week' | 'custom';

export type FilterOptions = {
  timePeriod: TimePeriod;
  dateRange?: DateRange;
  symbols: string[];
  tradeType: ('buy' | 'sell' | 'all')[];
  profitOnly: boolean;
  lossOnly: boolean;
  withNotes: boolean;
  tags: string[];
};
