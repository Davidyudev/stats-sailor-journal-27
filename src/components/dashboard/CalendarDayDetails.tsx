
import React from 'react';
import { format } from 'date-fns';
import { AlertTriangle, CalendarIcon, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { DailyPerformance } from '@/lib/types';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalendarDayDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  performance?: DailyPerformance;
  events: ForexEvent[];
  holiday?: {
    date: Date;
    name: string;
  };
}

export const CalendarDayDetails = ({
  isOpen,
  onClose,
  date,
  performance,
  events,
  holiday
}: CalendarDayDetailsProps) => {
  // Sort events by impact (high to low) and then by time
  const sortedEvents = [...events].sort((a, b) => {
    // Sort by impact first (high -> medium -> low)
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
    
    if (impactDiff !== 0) return impactDiff;
    
    // Then sort by time
    const timeA = a.time.replace(/AM|PM/, '').trim();
    const timeB = b.time.replace(/AM|PM/, '').trim();
    const isPMA = a.time.includes('PM');
    const isPMB = b.time.includes('PM');
    
    // Compare AM/PM first
    if (!isPMA && isPMB) return -1;
    if (isPMA && !isPMB) return 1;
    
    // Then compare the time
    return timeA.localeCompare(timeB);
  });

  // Ensure we have a valid date object and format it
  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : '';
  
  // Calculate wins from performance data using winRate
  const calculateWins = (performance: DailyPerformance) => {
    return Math.round(performance.winRate * performance.trades);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {formattedDate}
          </DialogTitle>
          <DialogDescription>
            Details for the selected date
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Holiday information */}
          {holiday && (
            <Card className="bg-muted/30 border-secondary/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-secondary font-medium">
                  <Clock className="h-4 w-4" />
                  <span>Holiday: {holiday.name}</span>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Trading performance */}
          {performance && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Trading Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit/Loss:</span>
                    <span className={cn(
                      "font-medium",
                      performance.profitLoss >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {performance.profitLoss >= 0 ? "+" : ""}{performance.profitLoss.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Trades:</span>
                    <span className="font-medium">{performance.trades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Win/Loss:</span>
                    <span className="font-medium">
                      {calculateWins(performance)}/{performance.trades - calculateWins(performance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Win Rate:</span>
                    <span className="font-medium">
                      {(performance.winRate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Economic events */}
          {sortedEvents.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium mb-2">Economic Events</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {sortedEvents.map((event, index) => (
                    <div key={index} className="border-b border-border/40 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "inline-block w-2 h-2 rounded-full",
                            event.impact === 'high' ? "bg-destructive" : 
                            event.impact === 'medium' ? "bg-warning" : "bg-muted-foreground"
                          )} />
                          <span className="font-medium">{event.currency}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <div className="text-sm mt-1">{event.name}</div>
                      
                      {(event.actual || event.forecast || event.previous) && (
                        <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                          {event.actual && (
                            <div>
                              <span className="text-muted-foreground">Actual: </span>
                              <span className="font-medium">{event.actual}</span>
                            </div>
                          )}
                          {event.forecast && (
                            <div>
                              <span className="text-muted-foreground">Forecast: </span>
                              <span className="font-medium">{event.forecast}</span>
                            </div>
                          )}
                          {event.previous && (
                            <div>
                              <span className="text-muted-foreground">Previous: </span>
                              <span className="font-medium">{event.previous}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {!performance && !holiday && sortedEvents.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No data available for this day
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
