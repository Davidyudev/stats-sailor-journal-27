
import { Trade } from '@/lib/types';

interface TagsSectionProps {
  trade: Trade;
}

export const TagsSection = ({ trade }: TagsSectionProps) => {
  if (!trade.tags || trade.tags.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <span className="text-muted-foreground text-sm">Tags</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {trade.tags.map(tag => (
          <div key={tag} className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-xs">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};
