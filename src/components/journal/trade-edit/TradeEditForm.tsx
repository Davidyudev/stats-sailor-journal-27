import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Trade } from '@/lib/types';
import { BasicInfoFields } from './BasicInfoFields';
import { DateFields } from './DateFields';
import { PriceFields } from './PriceFields';
import { TradeDetailsFields } from './TradeDetailsFields';
import { FinancialFields } from './FinancialFields';
import { TagsAndNotesFields } from './TagsAndNotesFields';

interface TradeEditFormProps {
  trade: Trade;
  onSave: (updatedTrade: Trade) => void;
  onClose: () => void;
}

// Helper to format dates for input fields
const formatDateForInput = (date: Date): string => {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16); // Format: YYYY-MM-DDThh:mm
};

export const TradeEditForm = ({ 
  trade, 
  onSave, 
  onClose 
}: TradeEditFormProps) => {
  // Use a separate interface for the form data to handle string dates
  interface FormDataType extends Omit<Partial<Trade>, 'openDate' | 'closeDate'> {
    openDate?: string;
    closeDate?: string;
  }

  const [formData, setFormData] = useState<FormDataType>({});

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement; // Cast to HTMLInputElement to access type
    
    // Handle different input types
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else if (name === 'openDate' || name === 'closeDate') {
      setFormData({
        ...formData,
        [name]: value // Keep as string in the form
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
      // Calculate pips based on price changes but keep profitLoss as manually entered
      let pips = 0;
      
      if (formData.type === 'buy') {
        pips = ((formData.closePrice || 0) - (formData.openPrice || 0)) * 10000;
      } else {
        pips = ((formData.openPrice || 0) - (formData.closePrice || 0)) * 10000;
      }
      
      // Convert string dates back to Date objects for the updated trade
      const updatedTrade: Trade = {
        ...trade,
        ...formData,
        openDate: formData.openDate ? new Date(formData.openDate) : trade.openDate,
        closeDate: formData.closeDate ? new Date(formData.closeDate) : trade.closeDate,
        pips,
        // Use the manually entered profitLoss if provided, otherwise keep the existing value
        profitLoss: formData.profitLoss !== undefined ? formData.profitLoss : trade.profitLoss,
      } as Trade;
      
      onSave(updatedTrade);
      onClose();
      toast.success(`Trade ${updatedTrade.symbol} updated successfully`);
    } catch (error) {
      toast.error('Error updating trade');
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <BasicInfoFields 
        symbol={formData.symbol || ''} 
        type={formData.type || ''} 
        onChange={handleChange} 
      />
      
      <DateFields 
        openDate={formData.openDate || ''} 
        closeDate={formData.closeDate || ''} 
        onChange={handleChange} 
      />
      
      <PriceFields 
        openPrice={formData.openPrice || 0} 
        closePrice={formData.closePrice || 0} 
        onChange={handleChange} 
      />
      
      <TradeDetailsFields 
        lots={formData.lots || 0} 
        status={formData.status || ''} 
        takeProfit={formData.takeProfit} 
        stopLoss={formData.stopLoss} 
        onChange={handleChange} 
      />
      
      <FinancialFields 
        profitLoss={formData.profitLoss || 0} 
        commission={formData.commission} 
        swap={formData.swap} 
        onChange={handleChange} 
      />
      
      <TagsAndNotesFields 
        tags={formData.tags?.join(', ') || ''} 
        notes={formData.notes} 
        comments={formData.comments} 
        onChange={handleChange} 
      />
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};
