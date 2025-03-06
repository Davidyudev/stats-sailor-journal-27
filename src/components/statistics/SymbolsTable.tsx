
import { Symbol } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SymbolsTableProps {
  symbols: Symbol[];
}

export const SymbolsTable = ({ symbols }: SymbolsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Symbol Performance</CardTitle>
        <CardDescription>Performance breakdown by trading instrument</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Trades</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Win Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total P/L</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Pips</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {symbols.length > 0 ? (
                symbols.map((symbol, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{symbol.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{symbol.tradesCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{symbol.winRate}%</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${symbol.totalPL >= 0 ? 'text-profit' : 'text-loss'}`}>
                      ${symbol.totalPL.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${symbol.averagePips >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {symbol.averagePips.toFixed(1)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No data available for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
