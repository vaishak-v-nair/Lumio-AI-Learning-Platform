
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, Medal, Star, Trophy } from 'lucide-react';
import DetailedDiagnosticReport from '@/components/dashboard/DetailedDiagnosticReport';
import LearningRecommendations from '@/components/dashboard/LearningRecommendations';
import type { TestResult } from '@/lib/firestore';

const achievementIcons: { [key: string]: React.ReactNode } = {
    mastered_topic: <Medal className="h-6 w-6 text-amber-500" />,
    quick_thinker: <Star className="h-6 w-6 text-yellow-500" />,
    streak_5: <Zap className="h-6 w-6 text-blue-500" />,
    first_test: <Trophy className="h-6 w-6 text-green-500" />,
};

export default function TestResults({ result, onBackToDashboard }: { result: TestResult, onBackToDashboard: () => void }) {

    if (!result) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const earnedAchievements = [];
    if (result.score >= 90) earnedAchievements.push({id: 'mastered_topic', title: "Topic Master"});
    if (result.timings.every((t) => t < 30)) earnedAchievements.push({id: 'quick_thinker', title: "Quick Thinker"});
    earnedAchievements.push({id: 'first_test', title: 'First Step'}); // Always earned on first test
    earnedAchievements.push({ id: 'streak_5', title: "5-Day Streak" }); // Mocked


    return (
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                <Card className="text-center w-full">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold font-headline">Test Complete!</CardTitle>
                        <CardDescription>Here's a summary of your performance on {result.topic}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl text-muted-foreground">Your Score:</p>
                        <p className={`text-6xl font-bold ${result.score >= 70 ? 'text-green-500' : 'text-destructive'}`}>
                            {Math.round(result.score)}%
                        </p>
                    </CardContent>
                </Card>
                <div className="w-full">
                    <DetailedDiagnosticReport />
                </div>
            </div>

            <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <LearningRecommendations />
                <Card>
                    <CardHeader>
                        <CardTitle>Achievements Unlocked</CardTitle>
                        <CardDescription>Your accomplishments from this test.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {earnedAchievements.length > 0 ? (
                            earnedAchievements.map((ach) => (
                                <div key={ach.id} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                                    <div className="p-2 bg-background rounded-full">
                                        {achievementIcons[ach.id]}
                                    </div>
                                    <p className="font-semibold">{ach.title}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No new achievements this time. Keep practicing!</p>
                        )}
                    </CardContent>
                </Card>
                <Button size="lg" className="rounded-full w-full" onClick={onBackToDashboard}>Back to Dashboard</Button>
            </div>
        </div>
    );
}
