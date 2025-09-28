import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type PerformanceDataItem = {
  fundamental: string;
  accuracy: number;
  avgResponseTime: number;
  assessment: string;
  icon: string;
};

const getAssessment = (accuracy: number, time: number) => {
    if (accuracy >= 80) return "Good";
    if (accuracy >= 60) return "Needs focus";
    if (accuracy < 50 && time > 60) return "Weak (slow & inaccurate)";
    if (accuracy < 50) return "Very Weak";
    return "Needs focus";
}

const getIcon = (accuracy: number) => {
    if (accuracy >= 80) return "✅";
    if (accuracy >= 60) return "⚠️";
    return "❌";
}

export function useDetailedDiagnostics() {
  const [performanceData, setPerformanceData] = useState<PerformanceDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const topic = params.topic as string;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedResults = localStorage.getItem('testResults');
      if (storedResults && topic === 'time-and-distance') { // Only show data for the relevant topic
          const results = JSON.parse(storedResults);
          const categoryData: { [key: string]: { times: number[], corrects: number[] } } = {};

          results.questions.forEach((q: any, index: number) => {
              if (!categoryData[q.category]) {
                  categoryData[q.category] = { times: [], corrects: [] };
              }
              categoryData[q.category].times.push(results.timings[index]);
              categoryData[q.category].corrects.push(results.answers[index] === q.correctAnswerIndex ? 1 : 0);
          });
          
          const data: PerformanceDataItem[] = Object.keys(categoryData).map(category => {
              const times = categoryData[category].times;
              const corrects = categoryData[category].corrects;
              const accuracy = (corrects.reduce((a, b) => a + b, 0) / corrects.length) * 100;
              const avgResponseTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
              
              return {
                  fundamental: category,
                  accuracy: Math.round(accuracy),
                  avgResponseTime: avgResponseTime,
                  assessment: getAssessment(accuracy, avgResponseTime),
                  icon: getIcon(accuracy),
              };
          });

          setPerformanceData(data);
      } else {
          setPerformanceData([]);
      }
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
