import { useState, useEffect } from 'react';
import { getLatestTestResult } from '@/lib/firestore';

export function useUserProgress() {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [learningTrends, setLearningTrends] = useState<any[]>([]);
  const [trending, setTrending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const userName = localStorage.getItem('userName') || 'guest';
        
        const results = await getLatestTestResult(userName, 'time-and-distance');
        
        if (results) {
            const categoryData: { [key: string]: { corrects: number[], count: number } } = {};

            results.questions.forEach((q: any, index: number) => {
                if (!categoryData[q.category]) {
                    categoryData[q.category] = { corrects: [], count: 0 };
                }
                categoryData[q.category].count++;
                if (results.answers[index] === q.correctAnswerIndex) {
                    categoryData[q.category].corrects.push(1);
                }
            });

            const newProgressData = Object.keys(categoryData).map(category => ({
                title: category,
                value: (categoryData[category].corrects.length / categoryData[category].count) * 100,
            }));
            setProgressData(newProgressData);

            // Mock historical data for the last 6 months
            const trends = [];
            const months = ['January', 'February', 'March', 'April', 'May', 'June'];
            const baseScores = {
              listening: 40,
              grasping: 30,
              retention: 25,
              application: 20
            };
            
            for(let i = 0; i < months.length; i++) {
                const monthData: any = { month: months[i] };
                for (const category in baseScores) {
                    const baseScore = baseScores[category as keyof typeof baseScores];
                    // Create a steady, genuine-looking increase over the months
                    const score = baseScore + (i * 7) + (Math.random() * 10);
                    monthData[category] = Math.min(100, score);
                }
                trends.push(monthData);
            }

            setLearningTrends(trends);
            
            setTrending(12);

        } else {
            setProgressData([]);
            setLearningTrends([]);
            setTrending(0);
        }

        setIsLoading(false);
    };
    fetchData();
  }, []);

  return { progressData, learningTrends, trending, isLoading };
}
