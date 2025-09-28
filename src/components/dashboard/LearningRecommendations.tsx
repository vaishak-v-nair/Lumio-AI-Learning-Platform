"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Lightbulb } from "lucide-react";
import { generateLearningRecommendation } from '@/ai/flows/generate-learning-recommendation';
import type { LearningRecommendationOutput } from '@/ai/flows/generate-learning-recommendation';


export default function LearningRecommendations() {
    const [recommendation, setRecommendation] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendation = async () => {
            setIsLoading(true);
            try {
                const result: LearningRecommendationOutput = await generateLearningRecommendation({
                    studentId: 'student123',
                    weakness: 'Retention',
                    context: 'student'
                });
                setRecommendation(result.recommendation);
            } catch (error) {
                console.error("Failed to generate recommendation:", error);
                setRecommendation('');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecommendation();
    }, []);


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

    if (!recommendation) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>Personalized Plan</CardTitle>
                    <CardDescription>AI-powered suggestions for your growth.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>No Recommendations Yet</AlertTitle>
                        <AlertDescription>
                            Complete a few tests to get your personalized learning plan.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="bg-primary/5 border-primary">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Your Personalized Plan</CardTitle>
                <CardDescription>AI-powered suggestions to help you improve.</CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground">{recommendation}</p>
            </CardContent>
        </Card>
    );
}
