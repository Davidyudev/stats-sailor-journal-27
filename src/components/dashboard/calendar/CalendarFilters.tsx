
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem 
} from '@/components/ui/dropdown-menu';

interface CalendarFiltersProps {
  impactFilters: {
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  handleToggleImpact: (impact: 'high' | 'medium' | 'low') => void;
  currencyFilter: string;
  setCurrencyFilter: (value: string) => void;
  availableCurrencies: string[];
  selectedCurrencies: Record<string, boolean>;
  handleToggleCurrency: (currency: string) => void;
  handleSelectAllCurrencies: (selected: boolean) => void;
  goToToday: () => void;
}

export const CalendarFilters = ({
  impactFilters,
  handleToggleImpact,
  currencyFilter,
  setCurrencyFilter,
  availableCurrencies,
  selectedCurrencies,
  handleToggleCurrency,
  handleSelectAllCurrencies,
  goToToday
}: CalendarFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Impact Filter</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={impactFilters.high}
              onCheckedChange={() => handleToggleImpact('high')}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive"></span>
                High Impact
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={impactFilters.medium}
              onCheckedChange={() => handleToggleImpact('medium')}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                Medium Impact
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={impactFilters.low}
              onCheckedChange={() => handleToggleImpact('low')}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                Low Impact
              </div>
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Currency Filter</DropdownMenuLabel>
          <div className="px-2 py-1.5">
            <Input
              placeholder="Search currencies..."
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <DropdownMenuSeparator />
          <div className="max-h-40 overflow-auto">
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                checked={Object.values(selectedCurrencies).every(v => v)}
                onCheckedChange={handleSelectAllCurrencies}
              >
                Select All
              </DropdownMenuCheckboxItem>
              
              {availableCurrencies
                .filter(currency => 
                  !currencyFilter || 
                  currency.toLowerCase().includes(currencyFilter.toLowerCase())
                )
                .map(currency => (
                  <DropdownMenuCheckboxItem
                    key={currency}
                    checked={selectedCurrencies[currency] || false}
                    onCheckedChange={() => handleToggleCurrency(currency)}
                  >
                    {currency}
                  </DropdownMenuCheckboxItem>
                ))
              }
            </DropdownMenuGroup>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        size="sm"
        variant="outline"
        className="text-xs"
        onClick={goToToday}
      >
        TODAY
      </Button>
    </div>
  );
};
