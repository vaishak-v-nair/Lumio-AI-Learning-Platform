import { useState, useEffect } from 'react';

const initialProgressData = [
  { title: "Listening", value: 78 },
  { title: "Grasping", value: 92 },
  { title: "Retention", value: 65 },
  { title: "Application", value: 85 },
];

const initialLearningTrends = [
  { month: "January", listening: 18, grasping: 25, retention: 22, application: 30 },
  { month: "February", listening: 30, grasping: 35, retention: 28, application: 38 },
  { month: "March", listening: 40, grasping: 50, retention: 35, application: 55 },
  { month: "April", listening: 45, grasping: 60, retention: 40, application: 62 },
  { month: "May", listening: 55, grasping: 70, retention: 58, application: 75 },
  { month: "June", listening: 78, grasping: 92, retention: 65, application: 85 },
];

const initialTrending = 5.2;

export function useUserProgress() {
  const [progressData, setProgressData] = useState(initialProgressData);
  const [learningTrends, setLearningTrends] = useState(initialLearningTrends);
  const [trending, setTrending] = useState(initialTrending);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    // For this example, we'll just use the initial data.
    // e.g. fetch('/api/user-progress').then(res => res.json()).then(data => {
    //   setProgressData(data.progressData);
    //   setLearningTrends(data.learningTrends);
    //   setTrending(data.trending);
    // });
  }, []);

  return { progressData, learningTrends, trending };
}
