
import React from 'react';
import { TradeFormField } from './TradeFormField';

interface BasicInfoFieldsProps {
  symbol: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicInfoFields = ({ symbol, type, onChange }: BasicInfoFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TradeFormField
        id="symbol"
        label="Symbol"
        value={symbol}
        onChange={onChange}
        required
      />
      
      <TradeFormField
        id="type"
        label="Type"
        value={type}
        onChange={onChange}
        required
      />
    </div>
  );
};
