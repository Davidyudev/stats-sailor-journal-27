
import React from 'react';
import { TradeFormField } from './TradeFormField';

interface DateFieldsProps {
  openDate: string;
  closeDate: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DateFields = ({ openDate, closeDate, onChange }: DateFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <TradeFormField
        id="openDate"
        label="Open Date"
        type="datetime-local"
        value={openDate}
        onChange={onChange}
        required
      />
      
      <TradeFormField
        id="closeDate"
        label="Close Date"
        type="datetime-local"
        value={closeDate}
        onChange={onChange}
        required
      />
    </div>
  );
};
