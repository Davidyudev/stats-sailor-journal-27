
import React from 'react';
import { TradeFormField } from './TradeFormField';

interface FinancialFieldsProps {
  profitLoss: number;
  commission?: number;
  swap?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FinancialFields = ({ 
  profitLoss, 
  commission, 
  swap, 
  onChange 
}: FinancialFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <TradeFormField
          id="profitLoss"
          label="Profit/Loss"
          type="number"
          step="0.01"
          value={profitLoss}
          onChange={onChange}
          required
        />
        
        <TradeFormField
          id="commission"
          label="Commission"
          type="number"
          step="0.01"
          value={commission || 0}
          onChange={onChange}
        />
      </div>
      
      <div className="space-y-2">
        <TradeFormField
          id="swap"
          label="Swap"
          type="number"
          step="0.01"
          value={swap || 0}
          onChange={onChange}
        />
      </div>
    </>
  );
};
