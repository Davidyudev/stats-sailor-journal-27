
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFilteredStatistics } from '@/hooks/useFilteredStatistics';
import { StatsHeader } from '@/components/statistics/StatsHeader';
import { StatsOverview } from '@/components/statistics/StatsOverview';
import { TradeSummary } from '@/components/statistics/TradeSummary';
import { TradeExtremes } from '@/components/statistics/TradeExtremes';
import { SymbolsTable } from '@/components/statistics/SymbolsTable';
import { AdvancedMetrics } from '@/components/statistics/AdvancedMetrics';

const Statistics = () => {
  const {
    dateRange,
    setDateRange,
    selectedTags,
    setSelectedTags,
    availableTags,
    filteredStats,
    filteredSymbols,
  } = useFilteredStatistics();

  return (
    <div className="space-y-6">
      <StatsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedTags={selectedTags}
        availableTags={availableTags}
        onTagsChange={setSelectedTags}
      />

      <StatsOverview stats={filteredStats} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="symbols">Symbols</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TradeSummary stats={filteredStats} />
            <TradeExtremes stats={filteredStats} />
          </div>
        </TabsContent>
        
        <TabsContent value="symbols" className="space-y-4">
          <SymbolsTable symbols={filteredSymbols} />
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <AdvancedMetrics stats={filteredStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Statistics;
