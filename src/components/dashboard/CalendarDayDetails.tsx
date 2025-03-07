
import React from 'react';
import { ForexEvent } from '@/lib/services/forexFactoryService';
import { DailyPerformance } from '@/lib/types';
import { 
  Dialog,
  DialogContent
} from '@/components/ui/dialog';
import { CalendarDialogHeader } from './calendar/details/DialogHeader';
import { HolidayCard } from './calendar/details/HolidayCard';
import { PerformanceCard } from './calendar/details/PerformanceCard';
import { EventsCard } from './calendar/details/EventsCard';
import { EmptyState } from './calendar/details/EmptyState';

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <CalendarDialogHeader date={date} />
        
        <div className="space-y-4">
          {/* Holiday information */}
          {holiday && <HolidayCard name={holiday.name} />}
          
          {/* Trading performance */}
          {performance && <PerformanceCard performance={performance} />}
          
          {/* Economic events */}
          {sortedEvents.length > 0 && <EventsCard events={sortedEvents} />}
          
          {!performance && !holiday && sortedEvents.length === 0 && <EmptyState />}
        </div>
      </DialogContent>
    </Dialog>
  );
};
