'use client';

import { useState, useEffect } from 'react';
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';
import { useTestResult } from '@/context/TestResultContext';
import type { Question } from '@/ai/flows/generate-personalized-test';

type HeatmapDataItem = {
    student: string;
    data: { topic: string; time: number }[];
};

const MOCK_STUDENTS = [
    { name: "Sanga", graspingTime: 90, retentionTime: 120, applicationTime: 150 },
    { name: "Alex", graspingTime: 50, retentionTime: 65, applicationTime: 80 },
    { name: "Ben", graspingTime: 110, retentionTime: 130, applicationTime: 100 },
];

export function useTeacherData() {
    const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);
    const [insights, setInsights] = useState('');
    const { latestResult: results, isLoading } = useTestResult();

    useEffect(() => {
        const fetchData = async () => {
            const studentData: HeatmapDataItem[] = [];

            // Add mock data for other students
            MOCK_STUDENTS.forEach(student => {
                 studentData.push({
                     student: student.name,
                     data: [
                        { topic: 'Grasping', time: student.graspingTime },
                        { topic: 'Retention', time: student.retentionTime },
                        { topic: 'Application', time: student.applicationTime },
                     ]
                 })
            })

            // Integrate the current user's real data
            if (results) {
                 const categoryData: { [key: string]: number[] } = {};
                 results.questions.forEach((q: Question, index: number) => {
                    const category = q.category || 'General';
                    if (!categoryData[category]) {
                        categoryData[category] = [];
                    }
                    categoryData[category].push(results.timings[index]);
                 });

                 const userCategoryTimes = [
                    { topic: 'Grasping', time: categoryData['Grasping'] ? Math.round(categoryData['Grasping'].reduce((a, b) => a + b, 0) / categoryData['Grasping'].length) : 0 },
                    { topic: 'Retention', time: categoryData['Retention'] ? Math.round(categoryData['Retention'].reduce((a, b) => a + b, 0) / categoryData['Retention'].length) : 0 },
                    { topic: 'Application', time: categoryData['Application'] ? Math.round(categoryData['Application'].reduce((a, b) => a + b, 0) / categoryData['Application'].length) : 0 },
                 ];
                 
                 const existingUserIndex = studentData.findIndex(s => s.student === results.userId);
                 if (existingUserIndex > -1) {
                     studentData[existingUserIndex].data = userCategoryTimes;
                 } else {
                     studentData.push({ student: results.userId, data: userCategoryTimes });
                 }
            }
            
            setHeatmapData(studentData);

            try {
                 const recommendation: LearningRecommendationOutput = await generateLearningRecommendation({
                    studentId: 'class_summary',
                    weakness: 'Retention', // Assuming retention is a class-wide issue based on mock data
                    context: 'teacher'
                });
                setInsights(recommendation.recommendation);
            } catch(error) {
                console.error("Failed to fetch teacher insights:", error);
                setInsights('Could not load AI insights at this time.');
            }

        };
        fetchData();
    }, [results]);

    const hasData = !isLoading && heatmapData.length > 0;

    return { heatmapData, insights, isLoading, hasData };
}
