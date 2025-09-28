import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';

export function useParentData() {
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const recommendation: LearningRecommendationOutput = await generateLearningRecommendation({
                    studentId: 'student123',
                    weakness: 'Application',
                    context: 'parent'
                });
                setInsights(recommendation.recommendation);
            } catch (error) {
                console.error("Failed to fetch parent insights:", error);
                setInsights(''); // Clear insights on error
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const hasData = !isLoading && insights.length > 0;

    return { insights, isLoading, hasData };
}
