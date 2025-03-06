
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { TagFilter } from '@/components/ui/tag-filter';

interface StatsHeaderProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  selectedTags: string[];
  availableTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const StatsHeader = ({
  dateRange,
  onDateRangeChange,
  selectedTags,
  availableTags,
  onTagsChange,
}: StatsHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Trading Statistics</h1>
      <p className="text-muted-foreground mb-4">Analyze your performance metrics and identify areas for improvement.</p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
          className="w-full sm:w-auto"
        />
        
        <TagFilter 
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagsChange={onTagsChange}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};
