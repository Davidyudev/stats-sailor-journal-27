
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
    <div className="glass-card rounded-md p-3 shadow-md border border-border/50 text-sm backdrop-blur-lg">
      <p className="font-medium mb-2 border-b pb-1 border-border/30">{label}</p>
      <div className="space-y-1">
        <p className={cn(
          "font-mono text-sm flex items-center justify-between",
          dailyPL >= 0 ? "text-profit" : "text-loss"
        )}>
          <span>Daily P/L:</span>
          <span className="font-semibold">{dailyPL >= 0 ? "+" : ""}{Number(dailyPL).toFixed(2)}</span>
        </p>
        <p className={cn(
          "font-mono text-sm flex items-center justify-between",
          accumulated >= 0 ? "text-profit" : "text-loss"
        )}>
          <span>Accumulated:</span>
          <span className="font-semibold">{accumulated >= 0 ? "+" : ""}{Number(accumulated).toFixed(2)}</span>
        </p>
        <p className="font-mono text-sm text-foreground flex items-center justify-between">
          <span>Trades:</span>
          <span className="font-semibold">{trades}</span>
        </p>
        <p className="font-mono text-sm text-foreground flex items-center justify-between">
          <span>Win Rate:</span>
          <span className={cn(
            "font-semibold",
            winRate >= 0.5 ? "text-profit" : winRate > 0 ? "text-yellow-500" : "text-muted-foreground"
          )}>
            {winRate ? (winRate * 100).toFixed(0) : 0}%
          </span>
        </p>
      </div>
    </div>
  );
};
