"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParentData } from "@/hooks/use-parent-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GraduationCap, Clock } from "lucide-react";

export default function PerformanceInsights() {
    const { insights, isLoading, hasData } = useParentData();

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
                    There are no performance insights for your child yet.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Child's Performance</CardTitle>
                <CardDescription>Time-awareness insights on their learning patterns.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-4 p-4 bg-accent/20 border-l-4 border-accent rounded-r-md">
                    <Clock className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                         <h4 className="font-semibold">Time Analysis</h4>
                         <p className="text-muted-foreground">{insights}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
