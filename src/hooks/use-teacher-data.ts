'use client';

import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';

type HeatmapDataItem = {
    student: string;
    data: { topic: string; time: number }[];
};

export function useTeacherData() {
    const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // In a real app, this would fetch data from a database.
                // We'll use localStorage to simulate this for now, based on Sanga's test results.
                const storedResults = localStorage.getItem('testResults');
                const studentData: HeatmapDataItem[] = [];

                if (storedResults) {
                     const results = JSON.parse(storedResults);
                     const categoryData: { topic: string; time: number }[] = [];
                     const categories: { [key: string]: number[] } = {};

                     results.questions.forEach((q: any, index: number) => {
                        if (!categories[q.category]) {
                            categories[q.category] = [];
                        }
                        categories[q.category].push(results.timings[index]);
                     });
                     
                     for (const category in categories) {
                        const avgTime = categories[category].reduce((a, b) => a + b, 0) / categories[category].length;
                        categoryData.push({ topic: category, time: Math.round(avgTime) });
                     }

                     studentData.push({ student: 'Sanga', data: categoryData });
                }

                // Add some mock data for other students for visualization purposes
                studentData.push({ student: 'Alex', data: [ { topic: 'Listening', time: 25 }, { topic: 'Grasping', time: 45 }, { topic: 'Retention', time: 60 }, { topic: 'Application', time: 80 } ] });
                studentData.push({ student: 'Maria', data: [ { topic: 'Listening', time: 40 }, { topic: 'Grasping', time: 50 }, { topic: 'Retention', time: 55 }, { topic: 'Application', time: 65 } ] });
                studentData.push({ student: 'Chen', data: [ { topic: 'Listening', time: 60 }, { topic: 'Grasping', time: 80 }, { topic: 'Retention', time: 100 }, { topic: 'Application', time: 130 } ] });


                setHeatmapData(studentData);

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
