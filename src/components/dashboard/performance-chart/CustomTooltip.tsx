
import { cn } from '@/lib/utils';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }
  
  // Safely access payload values with null checks
  const dailyPL = payload.find(p => p.dataKey === 'profit')?.value ?? 0;
  const accumulated = payload.find(p => p.dataKey === 'accumulatedProfit')?.value ?? 0;
  const trades = payload.find(p => p.dataKey === 'trades')?.value ?? 0;
  const winRate = payload.find(p => p.dataKey === 'winRate')?.value ?? 0;
  
  return (
    <div className="glass-card rounded-md p-3 shadow-sm border border-border/50 text-sm">
      <p className="font-medium mb-1">{label}</p>
      <p className={cn(
        "font-mono text-xs",
        dailyPL >= 0 ? "text-profit" : "text-loss"
      )}>
        Daily P/L: {dailyPL >= 0 ? "+" : ""}{Number(dailyPL).toFixed(2)}
      </p>
      <p className={cn(
        "font-mono text-xs",
        accumulated >= 0 ? "text-profit" : "text-loss"
      )}>
        Accumulated: {accumulated >= 0 ? "+" : ""}{Number(accumulated).toFixed(2)}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Trades: {trades}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        Win Rate: {winRate ? (winRate * 100).toFixed(0) : 0}%
      </p>
    </div>
  );
};
