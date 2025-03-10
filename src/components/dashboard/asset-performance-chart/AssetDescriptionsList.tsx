
import { cn } from '@/lib/utils';

interface Asset {
  name: string;
  pnl: number;
  trades: number;
  winRate: number;
}

interface AssetDescriptionsListProps {
  assets: Asset[];
}

export const AssetDescriptionsList = ({ assets }: AssetDescriptionsListProps) => {
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="text-xs space-y-2">
      <h4 className="text-sm font-medium">Asset Summary</h4>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
        {assets.map((asset) => (
          <div 
            key={asset.name} 
            className="flex items-center space-x-2 bg-muted/30 rounded-md p-2"
          >
            <div 
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                asset.pnl >= 0 ? "bg-profit" : "bg-loss"
              )} 
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{asset.name}</p>
              <div className="flex justify-between text-muted-foreground">
                <span>{asset.trades} trades</span>
                <span>{asset.winRate}% win</span>
              </div>
              <p className={cn(
                "font-mono text-right", 
                asset.pnl >= 0 ? "text-profit" : "text-loss"
              )}>
                {asset.pnl >= 0 ? "+" : ""}{asset.pnl.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
