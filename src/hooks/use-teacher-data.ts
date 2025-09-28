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
                     
                     // Ensure all 4 categories are present, even if with no data
                     const allCategories = ['Listening', 'Grasping', 'Retention', 'Application'];
                     allCategories.forEach(cat => {
                         if (!categories[cat]) {
                             categories[cat] = [];
                         }
                     });

                     for (const category in categories) {
                        const times = categories[category];
                        const avgTime = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
                        categoryData.push({ topic: category, time: avgTime });
                     }

                     studentData.push({ student: 'Sanga', data: categoryData });
                }
                
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
