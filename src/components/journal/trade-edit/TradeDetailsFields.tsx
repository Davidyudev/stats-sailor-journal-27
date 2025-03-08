
import React from 'react';
import { TradeFormField } from './TradeFormField';

interface TradeDetailsFieldsProps {
  lots: number;
  status: string;
  takeProfit?: number;
  stopLoss?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TradeDetailsFields = ({ 
  lots, 
  status, 
  takeProfit, 
  stopLoss, 
  onChange 
}: TradeDetailsFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <TradeFormField
          id="lots"
          label="Lots"
          type="number"
          step="0.01"
          value={lots}
          onChange={onChange}
          required
        />
        
        <TradeFormField
          id="status"
          label="Status"
          value={status}
          onChange={onChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <TradeFormField
          id="takeProfit"
          label="Take Profit"
          type="number"
          step="0.00001"
          value={takeProfit || ''}
          onChange={onChange}
        />
        
        <TradeFormField
          id="stopLoss"
          label="Stop Loss"
          type="number"
          step="0.00001"
          value={stopLoss || ''}
          onChange={onChange}
        />
      </div>
    </>
  );
};
