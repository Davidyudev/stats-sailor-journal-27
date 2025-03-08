
import React from 'react';
import { TradeFormField } from './TradeFormField';

interface TagsAndNotesFieldsProps {
  tags: string;
  notes?: string;
  comments?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TagsAndNotesFields = ({ 
  tags, 
  notes, 
  comments, 
  onChange 
}: TagsAndNotesFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <TradeFormField
          id="tags"
          label="Tags (comma separated)"
          value={tags}
          onChange={onChange}
        />
      </div>
      
      <div className="space-y-2">
        <TradeFormField
          id="notes"
          label="Notes"
          value={notes || ''}
          onChange={onChange}
        />
      </div>
      
      <div className="space-y-2">
        <TradeFormField
          id="comments"
          label="Trade Thoughts/Analysis"
          isTextArea={true}
          placeholder="Enter your thoughts and analysis about this trade..."
          value={comments || ''}
          onChange={onChange}
        />
      </div>
    </>
  );
};
