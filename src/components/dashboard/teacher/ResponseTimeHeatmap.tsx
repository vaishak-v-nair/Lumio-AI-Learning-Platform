
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeacherData } from "@/hooks/use-teacher-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Thermometer, Sparkles } from "lucide-react";

export default function ResponseTimeHeatmap() {
    const { heatmapData, insights, isLoading, hasData } = useTeacherData();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!hasData) {
        return (
            <Alert>
                <Thermometer className="h-4 w-4" />
                <AlertTitle>No Student Data Available</AlertTitle>
                <AlertDescription>
                    There is no student response time data to display yet. As students complete tests, this dashboard will populate.
                </AlertDescription>
            </Alert>
        );
    }

    const maxTime = Math.max(...heatmapData.flatMap(row => row.data.map(d => d.time)));

    const getColor = (time: number) => {
        if (time <= 0) return 'bg-muted/30';
        const ratio = time / maxTime;
        if (ratio < 0.4) return 'bg-green-500/20 text-green-900 dark:text-green-200';
        if (ratio < 0.7) return 'bg-yellow-500/20 text-yellow-900 dark:text-yellow-200';
        return 'bg-red-500/20 text-red-900 dark:text-red-200';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Classroom Response Time Analytics</CardTitle>
                    <CardDescription>Heatmap showing average time (in seconds) spent by students on different learning fundamentals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full align-middle">
                            <div className="flex">
                                <div className="w-32 flex-shrink-0">
                                    <div className="h-8"></div>
                                    {heatmapData[0]?.data.map((topic, i) => (
                                        <div key={i} className="h-12 flex items-center justify-end pr-2 text-sm font-medium text-muted-foreground">{topic.topic}</div>
                                    ))}
                                </div>
                                <div className="flex-grow grid" style={{ gridTemplateColumns: `repeat(${heatmapData.length}, minmax(0, 1fr))`}}>
                                    <div className="flex h-8 col-span-full">
                                        {heatmapData.map((student, i) => (
                                            <div key={i} className="w-full text-center text-sm font-medium text-muted-foreground truncate px-1">{student.student}</div>
                                        ))}
                                    </div>
                                    {heatmapData.map((student, i) => (
                                        <div key={i} className="w-full space-y-1 col-start-${i+1}">
                                            {student.data.map((d, j) => (
                                                <div key={j} className={`h-12 rounded-md flex items-center justify-center font-bold text-xs ${getColor(d.time)}`} title={`Avg time: ${d.time}s`}>
                                                    {d.time > 0 ? `${d.time}s` : 'N/A'}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-end items-center gap-4 mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500/20"></div>Fast</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>Average</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/20"></div>Slow</div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI-Powered Classroom Insight</CardTitle>
                    <CardDescription>An actionable recommendation based on overall class performance.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{insights}</p>
                </CardContent>
            </Card>
        </div>
    );
}
