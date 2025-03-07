
import React from 'react';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { Card, CardContent } from '@/components/ui/card';
import { EventItem } from './EventItem';

interface EventsCardProps {
  events: ForexEvent[];
}

export const EventsCard = ({ events }: EventsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="text-sm font-medium mb-2">Economic Events</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {events.map((event, index) => (
            <EventItem key={index} event={event} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
