
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';
import { Trade } from '@/lib/types';

interface ActionButtonsProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
}

export const ActionButtons = ({ trade, onEdit, onDelete }: ActionButtonsProps) => {
  return (
    <div className="border-t pt-4 flex gap-2">
      <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(trade)}>
        <Edit className="mr-1" size={14} /> Edit
      </Button>
      <Button variant="outline" size="sm" className="flex-1" onClick={() => onDelete(trade.id)}>
        <Trash2 className="mr-1" size={14} /> Delete
      </Button>
    </div>
  );
};
