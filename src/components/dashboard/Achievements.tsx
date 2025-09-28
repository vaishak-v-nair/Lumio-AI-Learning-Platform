
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Star, Zap } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { getLatestTestResult } from "@/lib/firestore";


type Achievement = {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
};

const achievementList: Achievement[] = [
    { id: 'mastered_topic', icon: <Medal className="text-amber-500" />, title: "Mastered Time & Distance", description: "Achieved 90%+ accuracy." },
    { id: 'quick_thinker', icon: <Star className="text-yellow-500" />, title: "Quick Thinker", description: "Answered all questions in under 30s each." },
    { id: 'streak_5', icon: <Zap className="text-blue-500" />, title: "5-Day Streak", description: "Completed a test every day for 5 days." },
];

export default function Achievements() {
    const [isLoading, setIsLoading] = useState(true);
    const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);

    useEffect(() => {
        const fetchAchievements = async () => {
            setIsLoading(true);
            const userName = localStorage.getItem('userName') || 'guest';
            const results = await getLatestTestResult(userName, 'time-and-distance');
            const achievements: Achievement[] = [];

            if (results) {
                // Achievement: Mastered Time & Distance
                if (results.score >= 90) {
                    const achievement = achievementList.find(a => a.id === 'mastered_topic');
                    if (achievement) achievements.push(achievement);
                }
                
                // Achievement: Quick Thinker
                const allFast = results.timings.every((t: number) => t < 30);
                if (allFast) {
                    const achievement = achievementList.find(a => a.id === 'quick_thinker');
                    if (achievement) achievements.push(achievement);
                }
                 // Mock a streak for demo purposes as it requires historical data
                const streakAchievement = achievementList.find(a => a.id === 'streak_5');
                if (streakAchievement) achievements.push(streakAchievement);
            }
            
            setEarnedAchievements(achievements);
            setIsLoading(false);
        };
        fetchAchievements();
    }, []);

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>A glimpse of your recent accomplishments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {earnedAchievements.length > 0 ? (
                    earnedAchievements.slice(0, 2).map((achievement, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                            <div className="p-2 bg-background rounded-full">
                               {achievement.icon}
                            </div>
                            <div>
                                <h4 className="font-semibold">{achievement.title}</h4>
                                <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <Alert>
                        <Trophy className="h-4 w-4" />
                        <AlertTitle>No Achievements Yet</AlertTitle>
                        <AlertDescription>
                            Complete tests to unlock new achievements and show off your skills!
                        </AlertDescription>
                    </Alert>
                )}
                 <Link href="/achievements" className="!mt-6 block">
                    <Button variant="outline" className="w-full">View All Achievements</Button>
                </Link>
            </CardContent>
        </Card>
    );
}
