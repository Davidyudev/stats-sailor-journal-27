
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { 
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface DialogHeaderProps {
  date: Date;
}

export const CalendarDialogHeader = ({ date }: DialogHeaderProps) => {
  // Ensure we have a valid date object and format it
  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM d, yyyy') : '';
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" />
        {formattedDate}
      </DialogTitle>
      <DialogDescription>
        Details for the selected date
      </DialogDescription>
    </DialogHeader>
  );
};
