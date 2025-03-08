
import { Trade } from '@/lib/types';

interface NotesSectionProps {
  trade: Trade;
}

export const NotesSection = ({ trade }: NotesSectionProps) => {
  if (!trade.notes) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <span className="text-muted-foreground text-sm">Notes</span>
      <p className="mt-2 text-sm bg-muted/50 p-3 rounded-md">
        {trade.notes}
      </p>
    </div>
  );
};
