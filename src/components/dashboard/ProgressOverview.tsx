'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUserProgress } from "@/hooks/use-user-progress";


export default function ProgressOverview() {
    const { progressData } = useUserProgress();
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>An overview of your core learning skills.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {progressData.map((item) => (
                    <div key={item.title}>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-sm font-bold text-primary">{item.value}%</p>
                        </div>
                        <Progress value={item.value} className="h-2 [&>div]:bg-primary" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
