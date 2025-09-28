"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal, Star, Zap } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const achievements = [
    { icon: <Medal className="text-amber-500" />, title: "Mastered Time & Distance", description: "Achieved 90%+ accuracy." },
    { icon: <Star className="text-yellow-500" />, title: "Quick Thinker", description: "Answered 50 questions in under 30s." },
    { icon: <Zap className="text-blue-500" />, title: "5-Day Streak", description: "Completed a test every day for 5 days." },
];

export default function Achievements() {
    const isLoading = false; // This can be replaced with a real loading state

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
                <CardDescription>Keep up the great work!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
                        <div className="p-2 bg-background rounded-full">
                           {achievement.icon}
                        </div>
                        <div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
