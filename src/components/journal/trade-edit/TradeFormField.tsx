
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TradeFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  step?: string;
  className?: string;
  isTextArea?: boolean;
  placeholder?: string;
}

export const TradeFormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  step,
  className = '',
  isTextArea = false,
  placeholder,
}: TradeFormFieldProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      {isTextArea ? (
        <Textarea
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={isTextArea ? "min-h-[120px] resize-y" : ""}
          required={required}
        />
      ) : (
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          step={step}
        />
      )}
    </div>
  );
};
