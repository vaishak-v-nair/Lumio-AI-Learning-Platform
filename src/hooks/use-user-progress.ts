
import { useState, useEffect } from 'react';
import { useTestResult } from '@/context/TestResultContext';
import type { Question } from '@/ai/flows/generate-personalized-test';

type ProgressItem = {
    title: string;
    value: number;
}

const DEFAULT_PROGRESS = [
    { title: "Grasping", value: 0 },
    { title: "Retention", value: 0 },
    { title: "Application", value: 0 },
    { title: "Listening", value: 0 },
];

export function useUserProgress() {
  const [progressData, setProgressData] = useState<ProgressItem[]>(DEFAULT_PROGRESS);
  const { latestResult: results, isLoading } = useTestResult();

  useEffect(() => {
    if (results) {
        const testDate = new Date(results.date);
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const isToday = (now.getTime() - testDate.getTime()) < oneDay;

        if (!isToday) {
            setProgressData(DEFAULT_PROGRESS);
            return;
        }

        const categoryData: { [key: string]: { corrects: number[], count: number } } = {};

        results.questions.forEach((q: Question, index: number) => {
            const category = q.category || "General";
            if (!categoryData[category]) {
                categoryData[category] = { corrects: [], count: 0 };
            }
            categoryData[category].count++;
            if (results.answers[index] === q.correctAnswerIndex) {
                categoryData[category].corrects.push(1);
            }
        });

        const allCategories = ["Grasping", "Retention", "Application", "Listening"];
        allCategories.forEach(cat => {
            if (!categoryData[cat]) {
                categoryData[cat] = { corrects: [], count: 0 };
            }
        });


        const newProgressData = Object.keys(categoryData).map(category => ({
            title: category,
            value: categoryData[category].count > 0 ? Math.round((categoryData[category].corrects.length / categoryData[category].count) * 100) : 0,
        }));
        setProgressData(newProgressData);

    } else {
        // Provide a default or empty state when no results are available
        setProgressData(DEFAULT_PROGRESS);
    }
  }, [results]);

  return { progressData, isLoading };
}
