
import { useState, useEffect } from 'react';
import { mockDataService } from '@/lib/services/mockDataService';
import { RecentTrades } from '@/components/dashboard/RecentTrades';
import { PerformanceCalendar } from '@/components/dashboard/PerformanceCalendar';
import { StatisticsCards } from '@/components/dashboard/StatisticsCards';
import { PerformanceOverview } from '@/components/dashboard/PerformanceOverview';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { getHolidays } from '@/components/dashboard/HolidaysData';
import { useTimePeriodFilter } from '@/hooks/useTimePeriodFilter';
import { Trade, DailyPerformance } from '@/lib/types';

const Index = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [performance, setPerformance] = useState<DailyPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const holidays = getHolidays();

  useEffect(() => {
    setTimeout(() => {
      setTrades(mockDataService.getTrades());
      setPerformance(mockDataService.getDailyPerformance());
      setIsLoading(false);
    }, 1000);
  }, []);

  const {
    selectedTimePeriod,
    setSelectedTimePeriod,
    filteredTrades,
    filteredSymbols,
    filteredPerformance
  } = useTimePeriodFilter(trades, performance, mockDataService.getSymbols());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatisticsCards filteredTrades={filteredTrades} />

      <div className="space-y-6">
        <PerformanceOverview 
          performance={filteredPerformance}
          symbols={filteredSymbols}
          selectedTimePeriod={selectedTimePeriod}
          setSelectedTimePeriod={setSelectedTimePeriod}
        />
        
        <ChartsSection
          filteredSymbols={filteredSymbols}
          filteredPerformance={filteredPerformance}
          filteredTrades={filteredTrades}
        />
        
        <PerformanceCalendar 
          data={filteredPerformance}
          holidays={holidays}
        />
      </div>
      
      <RecentTrades trades={mockDataService.getRecentTrades(10)} />
    </div>
  );
};

export default Index;
