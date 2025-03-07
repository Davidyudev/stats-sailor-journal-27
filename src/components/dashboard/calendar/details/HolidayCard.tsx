
import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HolidayCardProps {
  name: string;
}

export const HolidayCard = ({ name }: HolidayCardProps) => {
  return (
    <Card className="bg-muted/30 border-secondary/30">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-secondary font-medium">
          <Clock className="h-4 w-4" />
          <span>Holiday: {name}</span>
        </div>
      </CardContent>
    </Card>
  );
};
