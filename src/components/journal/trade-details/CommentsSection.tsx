
import { Trade } from '@/lib/types';

interface CommentsSectionProps {
  trade: Trade;
}

export const CommentsSection = ({ trade }: CommentsSectionProps) => {
  if (!trade.comments) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <span className="text-muted-foreground text-sm">Trade Analysis</span>
      <div className="mt-2 text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
        {trade.comments}
      </div>
    </div>
  );
};
