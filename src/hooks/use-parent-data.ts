
import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';
import { useTestResult } from '@/context/TestResultContext';

export function useParentData() {
    const [insights, setInsights] = useState('');
    const [strength, setStrength] = useState('');
    const [weakness, setWeakness] = useState('');
    const [score, setScore] = useState(0);
    const { latestResult: results, isLoading } = useTestResult();
    const [userName, setUserName] = useState('your child');

    useEffect(() => {
        const storedName = localStorage.getItem('userName') || 'your child';
        setUserName(storedName);

        const fetchData = async () => {
            if (isLoading || !results) return;
            
            setScore(Math.round(results.score));

            const categoryData: { [key: string]: { corrects: number[], count: number, score: number } } = {};
            results.questions.forEach((q, index) => {
                if (!categoryData[q.category]) {
                    categoryData[q.category] = { corrects: [], count: 0, score: 0 };
                }
                categoryData[q.category].count++;
                if (results.answers[index] === q.correctAnswerIndex) {
                    categoryData[q.category].corrects.push(1);
                }
            });

            let lowestScore = 101;
            let highestScore = -1;
            let weakArea = 'Application'; // Default
            let strongArea = 'Grasping'; // Default

            for (const category in categoryData) {
                const currentScore = (categoryData[category].corrects.length / categoryData[category].count) * 100;
                categoryData[category].score = currentScore;
                if (currentScore < lowestScore) {
                    lowestScore = currentScore;
                    weakArea = category;
                }
                if (currentScore > highestScore) {
                    highestScore = currentScore;
                    strongArea = category;
                }
            }
            
            setWeakness(weakArea);
            setStrength(strongArea);


            try {
                const recommendation: LearningRecommendationOutput = await generateLearningRecommendation({
                    studentId: 'student123',
                    weakness: weakArea,
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

    const hasData = !isLoading && !!results;

    return { insights, strength, weakness, score, isLoading, hasData, userName };
}
