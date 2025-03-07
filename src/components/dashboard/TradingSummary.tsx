
import { Symbol } from '@/lib/types';

interface TradingSummaryProps {
  symbols: Symbol[];
}

export const TradingSummary = ({ symbols }: TradingSummaryProps) => {
  const winningSymbols = symbols
    .filter(symbol => symbol.totalPL > 0)
    .sort((a, b) => b.totalPL - a.totalPL)
    .slice(0, 3);

  const losingSymbols = symbols
    .filter(symbol => symbol.totalPL < 0)
    .sort((a, b) => a.totalPL - b.totalPL)
    .slice(0, 3);

  return (
    <div className="glass-card rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Trading Summary</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Win/Loss Ratio</span>
            <span className="font-medium">
              {winningSymbols.length} / {losingSymbols.length}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${(winningSymbols.length / (winningSymbols.length + losingSymbols.length)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="text-xs text-muted-foreground mb-1">Top Performing</div>
          <div className="space-y-2">
            {winningSymbols.map(symbol => (
              <div key={symbol.name} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                  <span>{symbol.name}</span>
                </div>
                <span className="text-profit text-sm">+{symbol.totalPL.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-2">
          <div className="text-xs text-muted-foreground mb-1">Worst Performing</div>
          <div className="space-y-2">
            {losingSymbols.map(symbol => (
              <div key={symbol.name} className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-loss mr-2"></div>
                  <span>{symbol.name}</span>
                </div>
                <span className="text-loss text-sm">{symbol.totalPL.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
