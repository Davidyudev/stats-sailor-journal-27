
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { MountTransition } from '@/components/ui/mt4-connector';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    positive: boolean;
  };
  className?: string;
  delay?: number;
}

export const StatCard = ({
  icon,
  title,
  value,
  change,
  className,
  delay = 0
}: StatCardProps) => {
  return (
    <MountTransition delay={delay} className={cn("fade-up card-hover", className)}>
      <div className="glass-card relative overflow-hidden rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div className="z-10">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {change && (
              <p className={cn(
                "text-xs font-medium mt-1",
                change.positive ? "text-profit" : "text-loss"
              )}>
                {change.positive ? "+" : "-"}{change.value} {change.positive ? "↑" : "↓"}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </div>
    </MountTransition>
  );
};
