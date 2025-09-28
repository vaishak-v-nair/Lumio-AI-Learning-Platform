'use client';

import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';
import { getLatestTestResult } from '@/lib/firestore';

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
                const userName = localStorage.getItem('userName') || 'guest';
                const results = await getLatestTestResult(userName, 'time-and-distance');
                const studentData: HeatmapDataItem[] = [];

                if (results) {
                     const categoryData: { topic: string; time: number }[] = [];
                     const categories: { [key: string]: number[] } = {};

                     results.questions.forEach((q: any, index: number) => {
                        if (!categories[q.category]) {
                            categories[q.category] = [];
                        }
                        categories[q.category].push(results.timings[index]);
                     });
                     
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

                     studentData.push({ student: results.userId, data: categoryData });
                }
                
                setHeatmapData(studentData);

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
