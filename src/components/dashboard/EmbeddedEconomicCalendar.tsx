
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface EmbeddedEconomicCalendarProps {
  className?: string;
}

export const EmbeddedEconomicCalendar = ({ className }: EmbeddedEconomicCalendarProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Economic Calendar</h3>
          <a 
            href="https://www.investing.com/economic-calendar/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground flex items-center hover:text-primary transition-colors"
          >
            Investing.com <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
        
        <div className="relative rounded-md overflow-hidden border border-border">
          <iframe 
            src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=8&lang=1" 
            width="100%"
            height="500" 
            frameBorder="0" 
            allowTransparency={true}
            title="Economic Calendar - Investing.com"
            className="bg-background"
          />
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Real Time Economic Calendar provided by Investing.com
        </div>
      </CardContent>
    </Card>
  );
};
