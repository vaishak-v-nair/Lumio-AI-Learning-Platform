
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParentData } from "@/hooks/use-parent-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, Sparkles, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function PerformanceInsights() {
    const { insights, strength, weakness, score, isLoading, hasData, userName } = useParentData();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!hasData) {
        return (
            <Alert>
                <GraduationCap className="h-4 w-4" />
                <AlertTitle>No Performance Insights Available</AlertTitle>
                <AlertDescription>
                    There are no performance insights for {userName} yet. Once they complete a test, you'll see a detailed report here.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{userName}'s Learning Snapshot</CardTitle>
                    <CardDescription>A summary of their latest test performance and AI-driven insights.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Latest Score</p>
                            <p className={`text-5xl font-bold ${score >= 70 ? 'text-green-500' : 'text-destructive'}`}>{score}%</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Strengths</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{strength}</div>
                                <p className="text-xs text-muted-foreground">This is where {userName} is excelling.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">Areas for Improvement</CardTitle>
                                <TrendingDown className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{weakness}</div>
                                <p className="text-xs text-muted-foreground">Focusing here can make a big impact.</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
            
            <Card className="bg-primary/5 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Personalized Tip</CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-muted-foreground">{insights.replace("Your child", userName)}</p>
                </CardContent>
            </Card>
        </div>
    );
}
