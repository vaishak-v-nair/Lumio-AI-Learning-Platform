
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUserProgress } from "@/hooks/use-user-progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressOverview() {
    const { progressData, isLoading } = useUserProgress();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Daily Progress</CardTitle>
                <CardDescription>Your progress for the last 24 hours. Resets daily.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    <div className="space-y-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center mb-1">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-5 w-12" />
                                </div>
                                <Skeleton className="h-2 w-full" />
                            </div>
                        ))}
                    </div>
                ) : progressData.length > 0 ? (
                    progressData.map((item) => (
                        <div key={item.title}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-sm font-bold text-primary">{item.value}%</p>
                            </div>
                            <Progress value={item.value} className="h-2 [&>div]:bg-primary" />
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">No progress data available yet.</p>
                )}
            </CardContent>
        </Card>
    );
}
