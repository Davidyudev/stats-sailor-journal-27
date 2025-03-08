
import { Trade } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { TradeEditForm } from './trade-edit/TradeEditForm';

interface TradeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onSave: (updatedTrade: Trade) => void;
}

export const TradeEditDialog = ({ 
  isOpen, 
  onClose, 
  trade, 
  onSave 
}: TradeEditDialogProps) => {
  if (!trade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Trade: {trade.symbol}</DialogTitle>
        </DialogHeader>
        
        <TradeEditForm
          trade={trade}
          onSave={onSave}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
