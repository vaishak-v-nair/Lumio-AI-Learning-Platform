
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Zap, Medal, Star, Trophy, ArrowRight } from 'lucide-react';
import DetailedDiagnosticReport from '@/components/dashboard/DetailedDiagnosticReport';
import LearningRecommendations from '@/components/dashboard/LearningRecommendations';
import type { TestResult } from '@/lib/firestore';
import Link from 'next/link';

const achievementIcons: { [key: string]: React.ReactNode } = {
    mastered_topic: <Medal className="h-6 w-6 text-amber-500" />,
    quick_thinker: <Star className="h-6 w-6 text-yellow-500" />,
    streak_5: <Zap className="h-6 w-6 text-blue-500" />,
    first_test: <Trophy className="h-6 w-6 text-green-500" />,
};

const achievementTitles: { [key: string]: string } = {
    mastered_topic: "Topic Master",
    quick_thinker: "Quick Thinker",
    streak_5: "5-Day Streak",
    first_test: "First Step",
}


export default function TestResults({ result, onBackToDashboard }: { result: TestResult, onBackToDashboard: () => void }) {

    if (!result) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const earnedAchievements = [];
    // Always earned on any test completion
    earnedAchievements.push('first_test');

    if (result.score >= 90) earnedAchievements.push('mastered_topic');
    if (result.timings.every((t) => t < 30)) earnedAchievements.push('quick_thinker');
    
    // Mocked for demo
    earnedAchievements.push('streak_5'); 


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
                <Card>
                    <CardHeader>
                        <CardTitle>Achievements Unlocked!</CardTitle>
                        <CardDescription>Your accomplishments from this test.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {earnedAchievements.length > 0 ? (
                            earnedAchievements.map((achId) => (
                                <div key={achId} className="flex items-center gap-4 p-3 bg-secondary rounded-lg animate-fade-in-up">
                                    <div className="p-2 bg-background rounded-full">
                                        {achievementIcons[achId]}
                                    </div>
                                    <p className="font-semibold">{achievementTitles[achId]}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground">No new achievements this time. Keep practicing!</p>
                        )}
                        <Link href="/achievements" className="!mt-4 block">
                           <Button variant="outline" className="w-full">
                                View All Achievements <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                        </Link>
                    </CardContent>
                </Card>
                <LearningRecommendations />
                <Button size="lg" className="rounded-full w-full" onClick={onBackToDashboard}>Back to Dashboard</Button>
            </div>
        </div>
    );
}
