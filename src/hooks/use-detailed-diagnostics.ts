import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type PerformanceDataItem = {
  fundamental: string;
  accuracy: number;
  avgResponseTime: number;
  assessment: string;
  icon: string;
};

export function useDetailedDiagnostics() {
  const [performanceData, setPerformanceData] = useState<PerformanceDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const topic = params.topic as string;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // No more mock data. Set to empty array to represent no data.
      setPerformanceData([]);
      setIsLoading(false);
    };

    if (topic) {
      fetchData();
    } else {
        setIsLoading(false);
        setPerformanceData([]);
    }
  }, [topic]);

  const timeVsAccuracyData = performanceData.map(item => ({
    name: item.fundamental,
    "Accuracy": item.accuracy,
    "Avg. Time (s)": item.avgResponseTime,
  }));

  const radarChartData = performanceData.map(item => ({
    subject: item.fundamental,
    score: item.accuracy,
  }));

  const hasData = !isLoading && performanceData.length > 0;

  return { performanceData, timeVsAccuracyData, radarChartData, isLoading, hasData };
}
