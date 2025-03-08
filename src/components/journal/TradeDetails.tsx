
import { Trade } from '@/lib/types';
import { MountTransition } from '@/components/ui/mt4-connector';
import { toast } from 'sonner';
import { EmptyState } from './trade-details/EmptyState';
import { BasicInfo } from './trade-details/BasicInfo';
import { DateInfo } from './trade-details/DateInfo';
import { PriceInfo } from './trade-details/PriceInfo';
import { ProfitLossInfo } from './trade-details/ProfitLossInfo';
import { TagsSection } from './trade-details/TagsSection';
import { NotesSection } from './trade-details/NotesSection';
import { CommentsSection } from './trade-details/CommentsSection';
import { ActionButtons } from './trade-details/ActionButtons';

interface TradeDetailsProps {
  trade: Trade | null;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
}

export const TradeDetails = ({ 
  trade, 
  onEditTrade = () => {}, 
  onDeleteTrade = () => {} 
}: TradeDetailsProps) => {
  if (!trade) {
    return <EmptyState />;
  }

  const handleEdit = () => {
    onEditTrade(trade);
  };

  const handleDelete = () => {
    onDeleteTrade(trade.id);
    toast.success(`Trade ${trade.symbol} deleted successfully`);
  };

  return (
    <MountTransition 
      className="glass-card rounded-lg w-full lg:w-96 p-4 space-y-4 overflow-auto max-h-[calc(100vh-12rem)]"
      key={trade.id}
    >
      <BasicInfo trade={trade} />
      <DateInfo trade={trade} />
      <PriceInfo trade={trade} />
      <ProfitLossInfo trade={trade} />
      <TagsSection trade={trade} />
      <NotesSection trade={trade} />
      <CommentsSection trade={trade} />
      <ActionButtons 
        trade={trade} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
      />
    </MountTransition>
  );
};
