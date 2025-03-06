
import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface ChartDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartDetailModal: React.FC<ChartDetailModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  className,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden flex flex-col", className)}>
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogClose asChild>
            <button className="rounded-full h-6 w-6 flex items-center justify-center hover:bg-muted">
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartDetailModal;
