
import React from 'react';
import { TradeFormField } from './TradeFormField';

interface PriceFieldsProps {
  openPrice: number;
  closePrice: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PriceFields = ({ openPrice, closePrice, onChange }: PriceFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TradeFormField
        id="openPrice"
        label="Open Price"
        type="number"
        step="0.00001"
        value={openPrice}
        onChange={onChange}
        required
      />
      
      <TradeFormField
        id="closePrice"
        label="Close Price"
        type="number"
        step="0.00001"
        value={closePrice}
        onChange={onChange}
        required
      />
    </div>
  );
};
