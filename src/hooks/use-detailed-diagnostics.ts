import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type PerformanceDataItem = {
  fundamental: string;
  accuracy: number;
  avgResponseTime: number;
  assessment: string;
  icon: string;
};

const mockData: { [key: string]: PerformanceDataItem[] } = {
  'time-and-distance': [
    { fundamental: 'Listening', accuracy: 80, avgResponseTime: 30, assessment: 'Good', icon: '✅' },
    { fundamental: 'Grasping', accuracy: 65, avgResponseTime: 70, assessment: 'Needs focus', icon: '⚠️' },
    { fundamental: 'Retention', accuracy: 50, avgResponseTime: 90, assessment: 'Weak', icon: '❌' },
    { fundamental: 'Application', accuracy: 40, avgResponseTime: 120, assessment: 'Very Weak', icon: '❌' },
  ]
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
      
      const data = mockData[topic] || [];
      setPerformanceData(data);
      setIsLoading(false);
    };

    if (topic) {
      fetchData();
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

  const hasData = performanceData.length > 0;

  return { performanceData, timeVsAccuracyData, radarChartData, isLoading, hasData };
}
