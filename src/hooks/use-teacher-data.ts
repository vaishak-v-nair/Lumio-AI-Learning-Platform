import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';

type HeatmapDataItem = {
    student: string;
    data: { topic: string; time: number }[];
};

const mockHeatmapData: HeatmapDataItem[] = [
    { student: 'Sanga', data: [ { topic: 'Listening', time: 30 }, { topic: 'Grasping', time: 70 }, { topic: 'Retention', time: 90 }, { topic: 'Application', time: 120 } ] },
    { student: 'Alex', data: [ { topic: 'Listening', time: 25 }, { topic: 'Grasping', time: 45 }, { topic: 'Retention', time: 60 }, { topic: 'Application', time: 80 } ] },
    { student: 'Maria', data: [ { topic: 'Listening', time: 40 }, { topic: 'Grasping', time: 50 }, { topic: 'Retention', time: 55 }, { topic: 'Application', time: 65 } ] },
    { student: 'Chen', data: [ { topic: 'Listening', time: 60 }, { topic: 'Grasping', time: 80 }, { topic: 'Retention', time: 100 }, { topic: 'Application', time: 130 } ] },
];


export function useTeacherData() {
    const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Simulate API call for heatmap data
                await new Promise(resolve => setTimeout(resolve, 1500));
                setHeatmapData(mockHeatmapData);

                // Fetch AI-powered insights
                const recommendation: LearningRecommendationOutput = await generateLearningRecommendation({
                    studentId: 'class_summary',
                    weakness: 'Retention',
                    context: 'teacher'
                });
                setInsights(recommendation.recommendation);

            } catch (error) {
                 console.error("Failed to fetch teacher data:", error);
                 setHeatmapData([]);
                 setInsights('');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const hasData = !isLoading && heatmapData.length > 0;

    return { heatmapData, insights, isLoading, hasData };
}
