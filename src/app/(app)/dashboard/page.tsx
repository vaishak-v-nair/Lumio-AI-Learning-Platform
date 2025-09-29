
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Achievements from "@/components/dashboard/Achievements";
import LearningRecommendations from "@/components/dashboard/LearningRecommendations";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import MultiStepForm from "@/components/onboarding/MultiStepForm";
import TestClient from "@/components/test/TestClient";
import TestResults from "@/components/dashboard/TestResults";
import { useEffect, useState } from "react";
import { getUserProfile, createUserProfile, type UserProfile, type TestResult } from "@/lib/firestore";
import { generatePersonalizedTest } from "@/ai/flows/generate-personalized-test";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useTestResult } from "@/context/TestResultContext";

type ViewState = 'loading' | 'onboarding' | 'dashboard' | 'testing' | 'results';

export default function DashboardPage() {
    const [view, setView] = useState<ViewState>('loading');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentTest, setCurrentTest] = useState<any>(null);
    const [latestTestResult, setLatestTestResult] = useState<TestResult | null>(null);
    const { toast } = useToast();
    const { refreshResult } = useTestResult();

    useEffect(() => {
        const checkUser = async () => {
            const userName = localStorage.getItem('userName');
            if (!userName) {
                window.location.href = '/';
                return;
            }
            
            const profile = await getUserProfile(userName);
            setUserProfile(profile);
            if (profile) {
                setView('dashboard');
            } else {
                setView('onboarding');
            }
        };
        checkUser();
    }, []);

    const handleOnboardingComplete = async (profile: UserProfile) => {
        try {
            await createUserProfile(profile);
            localStorage.setItem('onboardingComplete', 'true');
            setUserProfile(profile);
            
            toast({
                title: "Let's Get Started!",
                description: "We're creating a personalized test to get you started.",
            });
            handleStartTest('personalized-test');

        } catch (error) {
            console.error('Onboarding failed:', error);
            toast({
                variant: 'destructive',
                title: 'Onboarding Failed',
                description: 'Could not save your profile. Please try again.',
            });
            setView('onboarding');
        }
    };
    
    const handleStartTest = async (topic: string) => {
        setView('loading');
        try {
            const testData = await generatePersonalizedTest({
                userDetails: userProfile?.userDetails || '',
                weakAreas: 'Grasping,Retention,Application',
                numberOfQuestions: 5,
            });
            
            const testId = crypto.randomUUID();
            const topicName = topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            
            setCurrentTest({ ...testData, topic: topicName, testId});
            setView('testing');

        } catch (error) {
            console.error('Failed to generate test:', error);
            toast({
                variant: 'destructive',
                title: 'Test Generation Failed',
                description: 'Could not create a personalized test. Please try again later.',
            });
            setView('dashboard');
        }
    }

    const handleTestFinish = (result: TestResult) => {
        setLatestTestResult(result);
        localStorage.setItem('lastTestResult', JSON.stringify(result));
        refreshResult(); // Update context for other components
        setView('results');
    };
    
    const handleBackToDashboard = () => {
        setLatestTestResult(null);
        setCurrentTest(null);
        setView('dashboard');
    }

    if (view === 'loading') {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (view === 'onboarding') {
        return <MultiStepForm onOnboardingComplete={handleOnboardingComplete} />;
    }

    if (view === 'testing' && currentTest) {
        return <TestClient testData={currentTest} onFinish={handleTestFinish} />;
    }

    if (view === 'results' && latestTestResult) {
        return <TestResults result={latestTestResult} onBackToDashboard={handleBackToDashboard} />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
                 <CardHeader>
                    <CardTitle>Start a New Test</CardTitle>
                    <CardDescription>Take a test tailored to your weak areas.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center">
                    <p className="my-6 text-sm text-muted-foreground">
                        Our AI will generate a personalized test to help you focus on what matters most.
                    </p>
                    <Button className="w-full max-w-xs rounded-full" onClick={() => handleStartTest('personalized-test')}>
                        Start Personalized Test
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Detailed Diagnostics</CardTitle>
                    <CardDescription>Drill down into your performance on specific topics.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
                    <div className="flex flex-col items-start justify-center text-left p-6 border rounded-2xl bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                        <h3 className="font-semibold text-xl">Time & Distance</h3>
                        <p className="text-sm text-muted-foreground my-2 flex-1">View detailed report for this topic, or start a new test.</p>
                         <div className="flex gap-2">
                            <Link href="/dashboard/diagnostics/time-and-distance">
                                <Button variant="outline" className="rounded-full">
                                    View Report
                                </Button>
                            </Link>
                             <Button className="rounded-full" onClick={() => handleStartTest('time-and-distance')}>
                                Start Test
                            </Button>
                        </div>
                    </div>
                     <div className="flex flex-col items-start justify-center text-left p-6 border rounded-2xl bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                        <h3 className="font-semibold text-xl">Percentages</h3>
                        <p className="text-sm text-muted-foreground my-2 flex-1">View detailed report for this topic, or start a new test.</p>
                        <div className="flex gap-2">
                            <Link href="/dashboard/diagnostics/percentages">
                                <Button variant="outline" className="rounded-full">
                                    View Report
                                </Button>
                            </Link>
                             <Button className="rounded-full" onClick={() => handleStartTest('percentages')}>
                                Start Test
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <div>
              <LearningRecommendations />
            </div>

          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <div>
              <ProgressOverview />
            </div>
            <Achievements />
          </div>
        </div>
    );
}
