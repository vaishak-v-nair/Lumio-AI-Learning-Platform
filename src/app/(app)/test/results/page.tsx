
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTestResultData } from '@/hooks/use-test-result-data';
import { Loader2, Zap, Medal, Star, Trophy } from 'lucide-react';
import Link from 'next/link';
import DetailedDiagnosticReport from '@/components/dashboard/DetailedDiagnosticReport';
import LearningRecommendations from '@/components/dashboard/LearningRecommendations';
import { useTestResult } from '@/context/TestResultContext';

const achievementIcons: { [key: string]: React.ReactNode } = {
    mastered_topic: <Medal className="h-6 w-6 text-amber-500" />,
    quick_thinker: <Star className="h-6 w-6 text-yellow-500" />,
    streak_5: <Zap className="h-6 w-6 text-blue-500" />,
    first_test: <Trophy className="h-6 w-6 text-green-500" />,
};

export default function TestResultsPage() {
    const router = useRouter();
    const { result, isLoading: isResultLoading } = useTestResultData();
    const { isLoading: isContextLoading } = useTestResult(); // To trigger re-render of recommendations

    useEffect(() => {
        if (!isResultLoading && !result) {
            router.push('/dashboard');
        }
    }, [result, isResultLoading, router]);

    if (isResultLoading || !result) {
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
        <div className="flex flex-col items-center justify-center w-full space-y-6">
            <Card className="text-center w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Test Complete!</CardTitle>
                    <CardDescription>Here's a summary of your performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-xl text-muted-foreground">Your Score:</p>
                    <p className={`text-6xl font-bold ${result.score >= 70 ? 'text-green-500' : 'text-destructive'}`}>
                        {Math.round(result.score)}%
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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
            </div>
            
            <div className="w-full">
                <DetailedDiagnosticReport />
            </div>

            <div className="flex justify-center mt-6">
                <Link href="/dashboard">
                    <Button size="lg" className="rounded-full">Back to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}

    
