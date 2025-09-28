"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeacherData } from "@/hooks/use-teacher-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Thermometer } from "lucide-react";

export default function ResponseTimeHeatmap() {
    const { heatmapData, isLoading, hasData } = useTeacherData();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!hasData) {
        return (
            <Alert>
                <Thermometer className="h-4 w-4" />
                <AlertTitle>No Student Data Available</AlertTitle>
                <AlertDescription>
                    There is no student response time data to display yet.
                </AlertDescription>
            </Alert>
        );
    }

    const maxTime = Math.max(...heatmapData.flatMap(row => row.data.map(d => d.time)));

    const getColor = (time: number) => {
        if (time < 0) return 'bg-gray-100';
        const ratio = time / maxTime;
        if (ratio < 0.33) return 'bg-green-200';
        if (ratio < 0.66) return 'bg-yellow-200';
        return 'bg-red-200';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Response Time Analytics</CardTitle>
                <CardDescription>Heatmap showing average time spent by students on different topics.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="flex">
                            <div className="w-32 flex-shrink-0">
                                <div className="h-8"></div>
                                {heatmapData[0]?.data.map((topic, i) => (
                                    <div key={i} className="h-10 flex items-center justify-end pr-2 text-sm font-medium text-muted-foreground">{topic.topic}</div>
                                ))}
                            </div>
                            <div className="flex-grow">
                                <div className="flex h-8">
                                    {heatmapData.map((student, i) => (
                                        <div key={i} className="w-20 text-center text-sm font-medium text-muted-foreground">{student.student}</div>
                                    ))}
                                </div>
                                <div className="flex">
                                    {heatmapData.map((student, i) => (
                                        <div key={i} className="w-20 space-y-1">
                                            {student.data.map((d, j) => (
                                                <div key={j} className={`h-10 rounded-sm flex items-center justify-center text-xs ${getColor(d.time)}`} title={`Avg time: ${d.time}s`}>
                                                    {d.time > 0 ? `${d.time}s` : '-'}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
