"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParentData } from "@/hooks/use-parent-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, Sparkles } from "lucide-react";

export default function PerformanceInsights() {
    const { insights, isLoading, hasData, userName } = useParentData();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!hasData) {
        return (
            <Alert>
                <GraduationCap className="h-4 w-4" />
                <AlertTitle>No Performance Insights Available</AlertTitle>
                <AlertDescription>
                    There are no performance insights for {userName} yet.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{userName}'s Performance</CardTitle>
                <CardDescription>AI-powered insights and recommendations for your child's learning.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4 p-4 bg-primary/10 border-l-4 border-primary rounded-r-md">
                    <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                         <h4 className="font-semibold">Personalized Recommendation</h4>
                         <p className="text-muted-foreground">{insights.replace("Your child", userName)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
