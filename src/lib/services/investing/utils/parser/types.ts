
import { InvestingEvent } from '../../types';

// Types related to parsing operations
export interface ParseResult {
  events: InvestingEvent[];
  diagnostics: {
    impactDistribution: Record<string, number>;
    eventCount: number;
    errors: string[];
  };
}

export interface ParserOptions {
  year: number;
  month: number;
  verbose?: boolean;
}
