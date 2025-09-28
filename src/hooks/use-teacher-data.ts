
'use client';

import { useState, useEffect } from 'react';
import { generateTeacherInsight } from '@/ai/flows/generate-teacher-insight';
import { useTestResult } from '@/context/TestResultContext';
import type { Question, GeneratePersonalizedTestOutput } from '@/ai/flows/generate-personalized-test';

type HeatmapDataItem = {
    student: string;
    data: { topic: string; time: number }[];
};

type TestResultWithUserId = GeneratePersonalizedTestOutput & {
    userId: string;
    timings: number[];
    answers: (number | null)[];
};


const MOCK_OTHER_RESULTS: TestResultWithUserId[] = [
    {
        userId: "Alex",
        questions: [
            { category: "Grasping", difficulty: 'easy', questionText: '', options: [], correctAnswerIndex: 0, explanation: '' },
            { category: "Retention", difficulty: 'medium', questionText: '', options: [], correctAnswerIndex: 0, explanation: '' },
            { category: "Application", difficulty: 'hard', questionText: '', options: [], correctAnswerIndex: 0, explanation: '' },
        ],
        timings: [50, 65, 80],
        answers: [0, 0, 0] // Assuming all correct for simplicity
    },
    {
        userId: "Ben",
        questions: [
            { category: "Grasping", difficulty: 'easy', questionText: '', options: [], correctAnswerIndex: 0, explanation: '' },
            { category: "Retention", difficulty: 'medium', questionText: '', options: [], correctAnswerIndex: 0, explanation: '' },
            { category: "Application", difficulty: 'hard', questionText: '', options: [], correctAnswerIndex: 0, explanation: '' },
        ],
        timings: [110, 130, 100],
        answers: [0, 1, 0] // 1 incorrect
    }
];


export function useTeacherData() {
    const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
    const [insights, setInsights] = useState('');
    const { latestResult, isLoading } = useTestResult();

    useEffect(() => {
        const fetchData = async () => {
            const allResults = latestResult ? [...MOCK_OTHER_RESULTS, latestResult] : [...MOCK_OTHER_RESULTS];
            
            const studentData: HeatmapDataItem[] = allResults.map(result => {
                const categoryData: { [key: string]: number[] } = {};
                result.questions.forEach((q: Question, index: number) => {
                    const category = q.category || 'General';
                    if (!categoryData[category]) {
                        categoryData[category] = [];
                    }
                    categoryData[category].push(result.timings[index]);
                });
                return {
                    student: result.userId,
                    data: ['Grasping', 'Retention', 'Application'].map(cat => ({
                        topic: cat,
                        time: categoryData[cat] ? Math.round(categoryData[cat].reduce((a, b) => a + b, 0) / categoryData[cat].length) : 0
                    }))
                };
            });
            setHeatmapData(studentData);


            // Generate AI Insight
            const classPerformance: { [key: string]: { scores: number[], times: number[] } } = {};

            allResults.forEach(result => {
                result.questions.forEach((q, index) => {
                    const category = q.category;
                    if (!classPerformance[category]) {
                        classPerformance[category] = { scores: [], times: [] };
                    }
                    classPerformance[category].scores.push(result.answers[index] === q.correctAnswerIndex ? 100 : 0);
                    classPerformance[category].times.push(result.timings[index]);
                });
            });

            const insightInput = Object.keys(classPerformance).map(category => {
                const data = classPerformance[category];
                const averageScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
                const averageTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
                return {
                    category,
                    averageScore: Math.round(averageScore),
                    averageTime: Math.round(averageTime)
                };
            });

            if (insightInput.length > 0) {
                 try {
                    const recommendation = await generateTeacherInsight({ classPerformance: insightInput });
                    setInsights(recommendation.insight);
                } catch(error) {
                    console.error("Failed to fetch teacher insights:", error);
                    setInsights('Could not load AI insights at this time.');
                }
            }
        };

        if (!isLoading) {
             fetchData();
        }
    }, [latestResult, isLoading]);

    const hasData = !isLoading && heatmapData.length > 0;

    return { heatmapData, insights, isLoading, hasData };
}
