import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';
import { useTestResult } from '@/context/TestResultContext';

export function useParentData() {
    const [insights, setInsights] = useState('');
    const { latestResult: results, isLoading } = useTestResult();
    const [userName, setUserName] = useState('your child');

    useEffect(() => {
        const storedName = localStorage.getItem('userName') || 'your child';
        setUserName(storedName);

        const fetchData = async () => {
            if (isLoading) return;

            let weakness = 'Application'; // Default weakness
            if (results) {
                const categoryData: { [key: string]: { corrects: number[], count: number } } = {};
                results.questions.forEach((q, index) => {
                    if (!categoryData[q.category]) {
                        categoryData[q.category] = { corrects: [], count: 0 };
                    }
                    categoryData[q.category].count++;
                    if (results.answers[index] === q.correctAnswerIndex) {
                        categoryData[q.category].corrects.push(1);
                    }
                });

                let lowestScore = 101;
                for (const category in categoryData) {
                    const score = (categoryData[category].corrects.length / categoryData[category].count) * 100;
                    if (score < lowestScore) {
                        lowestScore = score;
                        weakness = category;
                    }
                }
            }

            try {
                const recommendation: LearningRecommendationOutput = await generateLearningRecommendation({
                    studentId: 'student123',
                    weakness: weakness,
                    context: 'parent'
                });
                setInsights(recommendation.recommendation);
            } catch (error) {
                console.error("Failed to fetch parent insights:", error);
                setInsights("Could not load AI-powered insights at this time. Please try again later.");
            }
        };

        fetchData();
    }, [results, isLoading]);

    const hasData = !isLoading && insights.length > 0;

    return { insights, isLoading, hasData, userName };
}
