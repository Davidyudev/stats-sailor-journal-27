
import React from 'react';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { Card, CardContent } from '@/components/ui/card';
import { EventItem } from './EventItem';
import { cn } from '@/lib/utils';

interface EventsCardProps {
  events: ForexEvent[];
}

export const EventsCard = ({ events }: EventsCardProps) => {
  // Sort events by impact (high -> medium -> low) and then by time
  const sortedEvents = [...events].sort((a, b) => {
    // Sort by impact first
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

  // Group events by impact
  const groupedEvents = {
    high: sortedEvents.filter(e => e.impact === 'high'),
    medium: sortedEvents.filter(e => e.impact === 'medium'),
    low: sortedEvents.filter(e => e.impact === 'low'),
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-4">Economic Events</h3>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {Object.entries(groupedEvents).map(([impact, events]) => 
            events.length > 0 && (
              <div key={impact} className="space-y-2">
                <h4 className={cn(
                  "text-xs font-medium mb-2",
                  impact === 'high' ? "text-destructive" :
                  impact === 'medium' ? "text-warning" : "text-muted-foreground"
                )}>
                  {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
                </h4>
                <div className="space-y-3">
                  {events.map((event, index) => (
                    <EventItem key={index} event={event} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};
