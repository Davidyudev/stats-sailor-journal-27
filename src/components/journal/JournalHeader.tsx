import { Search, Filter, Download, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { TagFilter } from '@/components/ui/tag-filter';
import { TimePeriod, FilterOptions } from './types';

interface JournalHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableSymbols: string[];
  availableTags: string[];
  handleDateRangeChange: (range: DateRange | undefined) => void;
  handleTagsChange: (tags: string[]) => void;
  toggleSymbolFilter: (symbol: string) => void;
  toggleAllSymbols: () => void;
  toggleTradeTypeFilter: (type: 'buy' | 'sell' | 'all') => void;
}

export const JournalHeader = ({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  availableSymbols,
  availableTags,
  handleDateRangeChange,
  handleTagsChange,
  toggleSymbolFilter,
  toggleAllSymbols,
  toggleTradeTypeFilter
}: JournalHeaderProps) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Trading Journal</h1>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-2 top-2.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 w-full sm:w-64"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter size={16} className="mr-2" />
                Filters
                <ChevronDown size={16} className="ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Time Period</DropdownMenuLabel>
              <Select 
                value={filters.timePeriod} 
                onValueChange={(value) => {
                  if (value !== 'custom') {
                    setFilters(prev => ({ 
                      ...prev, 
                      timePeriod: value as TimePeriod,
                      dateRange: undefined
                    }));
                  } else {
                    setFilters(prev => ({ ...prev, timePeriod: value as TimePeriod }));
                  }
                }}
              >
                <SelectTrigger className="w-full h-8 mt-1">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              
              {filters.timePeriod === 'custom' && (
                <div className="mt-2">
                  <DateRangePicker 
                    dateRange={filters.dateRange}
                    onDateRangeChange={handleDateRangeChange}
                  />
                </div>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Symbols</DropdownMenuLabel>
              <div className="max-h-32 overflow-y-auto">
                <DropdownMenuCheckboxItem
                  checked={filters.symbols.length === availableSymbols.length}
                  onCheckedChange={toggleAllSymbols}
                >
                  All Symbols
                </DropdownMenuCheckboxItem>
                {availableSymbols.map(symbol => (
                  <DropdownMenuCheckboxItem
                    key={symbol}
                    checked={filters.symbols.includes(symbol)}
                    onCheckedChange={() => toggleSymbolFilter(symbol)}
                  >
                    {symbol}
                  </DropdownMenuCheckboxItem>
                ))}
              </div>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Trade Type</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.tradeType.includes('all')}
                onCheckedChange={() => toggleTradeTypeFilter('all')}
              >
                All Types
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.tradeType.includes('buy')}
                onCheckedChange={() => toggleTradeTypeFilter('buy')}
              >
                Buy
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.tradeType.includes('sell')}
                onCheckedChange={() => toggleTradeTypeFilter('sell')}
              >
                Sell
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Results</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.profitOnly}
                onCheckedChange={() => setFilters(prev => ({ ...prev, profitOnly: !prev.profitOnly, lossOnly: prev.lossOnly && !prev.profitOnly ? false : prev.lossOnly }))}
              >
                Profitable Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.lossOnly}
                onCheckedChange={() => setFilters(prev => ({ ...prev, lossOnly: !prev.lossOnly, profitOnly: prev.profitOnly && !prev.profitOnly ? false : prev.profitOnly }))}
              >
                Losing Only
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Other</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={filters.withNotes}
                onCheckedChange={() => setFilters(prev => ({ ...prev, withNotes: !prev.withNotes }))}
              >
                With Notes
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="h-9">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          
          <Button size="sm" className="h-9">
            <Plus size={16} className="mr-2" />
            New Trade
          </Button>
        </div>
      </div>
      
      <TagFilter 
        availableTags={availableTags}
        selectedTags={filters.tags}
        onTagsChange={handleTagsChange}
        className="w-full sm:w-auto"
      />
    </>
  );
};
