
import { useState, useEffect } from 'react';
import { Trade } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
  const [formData, setFormData] = useState<Partial<Trade>>({});

  useEffect(() => {
    if (trade) {
      setFormData({
        ...trade,
        // Convert dates to string format for inputs
        openDate: formatDateForInput(trade.openDate),
        closeDate: formatDateForInput(trade.closeDate)
      });
    }
  }, [trade]);

  // Helper to format dates for input fields
  const formatDateForInput = (date: Date): string => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'openDate' || name === 'closeDate') {
      setFormData({
        ...formData,
        [name]: value ? new Date(value) : new Date()
      });
    } else if (name === 'tags') {
      setFormData({
        ...formData,
        [name]: value.split(',').map(tag => tag.trim()).filter(tag => tag)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trade || !formData) return;
    
    try {
      // Calculate updated pips and profit/loss based on price changes
      let pips = 0;
      let profitLoss = 0;
      
      if (formData.type === 'buy') {
        pips = ((formData.closePrice || 0) - (formData.openPrice || 0)) * 10000;
      } else {
        pips = ((formData.openPrice || 0) - (formData.closePrice || 0)) * 10000;
      }
      
      profitLoss = pips * (formData.lots || 1) / 10;
      
      const updatedTrade: Trade = {
        ...trade,
        ...formData,
        pips,
        profitLoss,
      } as Trade;
      
      onSave(updatedTrade);
      onClose();
      toast.success(`Trade ${updatedTrade.symbol} updated successfully`);
    } catch (error) {
      toast.error('Error updating trade');
      console.error(error);
    }
  };

  if (!trade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Trade: {trade.symbol}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input 
                id="symbol" 
                name="symbol" 
                value={formData.symbol || ''} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input 
                id="type" 
                name="type" 
                value={formData.type || ''} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openDate">Open Date</Label>
              <Input 
                id="openDate" 
                name="openDate" 
                type="datetime-local" 
                value={formData.openDate as string || ''} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closeDate">Close Date</Label>
              <Input 
                id="closeDate" 
                name="closeDate" 
                type="datetime-local" 
                value={formData.closeDate as string || ''} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openPrice">Open Price</Label>
              <Input 
                id="openPrice" 
                name="openPrice" 
                type="number" 
                step="0.00001" 
                value={formData.openPrice || 0} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="closePrice">Close Price</Label>
              <Input 
                id="closePrice" 
                name="closePrice" 
                type="number" 
                step="0.00001" 
                value={formData.closePrice || 0} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lots">Lots</Label>
              <Input 
                id="lots" 
                name="lots" 
                type="number" 
                step="0.01" 
                value={formData.lots || 0} 
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Input 
                id="status" 
                name="status" 
                value={formData.status || ''} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input 
                id="takeProfit" 
                name="takeProfit" 
                type="number" 
                step="0.00001" 
                value={formData.takeProfit || ''} 
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input 
                id="stopLoss" 
                name="stopLoss" 
                type="number" 
                step="0.00001" 
                value={formData.stopLoss || ''} 
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input 
              id="tags" 
              name="tags" 
              value={formData.tags?.join(', ') || ''} 
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              name="notes" 
              value={formData.notes || ''} 
              onChange={handleChange}
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
