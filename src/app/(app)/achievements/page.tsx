
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Star, Zap, Trophy, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getLatestTestResult } from "@/lib/firestore";
import type { TestResult } from "@/lib/firestore";

type Achievement = {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
};

const allAchievements: Achievement[] = [
    { id: 'mastered_topic', icon: <Medal className="h-8 w-8 text-amber-500" />, title: "Topic Master", description: "Achieve 90%+ accuracy on any topic." },
    { id: 'quick_thinker', icon: <Star className="h-8 w-8 text-yellow-500" />, title: "Quick Thinker", description: "Answer all questions in a test in under 30s each." },
    { id: 'streak_5', icon: <Zap className="h-8 w-8 text-blue-500" />, title: "5-Day Streak", description: "Complete a test every day for 5 days." },
    { id: 'first_test', icon: <Trophy className="h-8 w-8 text-green-500" />, title: "First Step", description: "Complete your first personalized test." },
];

export default function AchievementsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const fetchAchievements = async () => {
            setIsLoading(true);
            const userName = localStorage.getItem('userName') || 'guest';
            const results = await getLatestTestResult(userName, 'time-and-distance');
            const earned = new Set<string>();

            if (results) {
                earned.add('first_test');
                
                if (results.score >= 90) {
                    earned.add('mastered_topic');
                }
                
                const allFast = results.timings.every((t: number) => t < 30);
                if (allFast) {
                    earned.add('quick_thinker');
                }
            }
            
            // Mock a streak for demo purposes
            if (results) {
              earned.add('streak_5');
            }

            setEarnedAchievements(earned);
            setIsLoading(false);
        }
        fetchAchievements();
    }, []);

    if (!isClient) {
        return (
             <div className="space-y-6">
                <h1 className="text-3xl font-bold font-headline">My Achievements</h1>
                <p className="text-muted-foreground">Here are all the badges you can earn. Keep learning!</p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    if (isLoading) {
        return (
             <div className="space-y-6">
                <h1 className="text-3xl font-bold font-headline">My Achievements</h1>
                <p className="text-muted-foreground">Here are all the badges you can earn. Keep learning!</p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 w-full" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Achievements</h1>
                <p className="text-muted-foreground">Here are all the badges you can earn. Keep learning!</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {allAchievements.map((achievement) => {
                    const isEarned = earnedAchievements.has(achievement.id);
                    return (
                        <Card key={achievement.id} className={cn("flex flex-col text-center transition-all", isEarned ? "border-primary shadow-lg" : "opacity-60")}>
                            <CardHeader className="items-center">
                                <div className={cn("p-4 rounded-full mb-2", isEarned ? "bg-primary/10" : "bg-muted")}>
                                   {isEarned ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
                                </div>
                                <CardTitle>{achievement.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <CardDescription>{achievement.description}</CardDescription>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
