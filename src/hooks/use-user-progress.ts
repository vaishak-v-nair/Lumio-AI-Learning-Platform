import { useState, useEffect } from 'react';

export function useUserProgress() {
  const [progressData, setProgressData] = useState<any[]>([]);
  const [learningTrends, setLearningTrends] = useState<any[]>([]);
  const [trending, setTrending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const storedResults = localStorage.getItem('testResults');
        if (storedResults) {
            const results = JSON.parse(storedResults);
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

            const month = new Date().toLocaleString('default', { month: 'long' });
            const newLearningTrends = Object.keys(categoryData).map(category => ({
                month,
                [category.toLowerCase()]: (categoryData[category].corrects.length / categoryData[category].count) * 100,
            }));

            // Merge with existing trend data if any
            const mergedTrends = newLearningTrends.reduce((acc, trend) => {
                const existing = acc.find(item => item.month === trend.month);
                if (existing) {
                    Object.assign(existing, trend);
                } else {
                    acc.push(trend);
                }
                return acc;
            }, [] as any[]);
            setLearningTrends(mergedTrends);
            
            // This is a mock trending value
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
