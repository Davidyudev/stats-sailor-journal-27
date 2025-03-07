
import React from 'react';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { Card, CardContent } from '@/components/ui/card';
import { EventItem } from './EventItem';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EventsCardProps {
  events: ForexEvent[];
}

export const EventsCard = ({ events }: EventsCardProps) => {
  // Group events by impact level
  const highImpactEvents = events.filter(event => event.impact === 'high')
    .sort((a, b) => a.time.localeCompare(b.time));
  
  const mediumImpactEvents = events.filter(event => event.impact === 'medium')
    .sort((a, b) => a.time.localeCompare(b.time));
  
  const lowImpactEvents = events.filter(event => event.impact === 'low')
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-4">Economic Events</h3>
        
        <Accordion type="multiple" defaultValue={['high-impact']} className="space-y-2">
          {highImpactEvents.length > 0 && (
            <AccordionItem value="high-impact" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-destructive rounded-full mr-2"></span>
                  <span>High Impact ({highImpactEvents.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-2 pt-0">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {highImpactEvents.map((event, index) => (
                    <EventItem key={`high-${index}`} event={event} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {mediumImpactEvents.length > 0 && (
            <AccordionItem value="medium-impact" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-warning rounded-full mr-2"></span>
                  <span>Medium Impact ({mediumImpactEvents.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-2 pt-0">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {mediumImpactEvents.map((event, index) => (
                    <EventItem key={`medium-${index}`} event={event} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {lowImpactEvents.length > 0 && (
            <AccordionItem value="low-impact" className="border rounded-md">
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-muted-foreground rounded-full mr-2"></span>
                  <span>Low Impact ({lowImpactEvents.length})</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-2 pt-0">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {lowImpactEvents.map((event, index) => (
                    <EventItem key={`low-${index}`} event={event} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
        
        {events.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            No economic events for this day
          </div>
        )}
      </CardContent>
    </Card>
  );
};
