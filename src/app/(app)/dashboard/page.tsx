
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
import { generateQuestionsFromTopicData } from '@/ai/flows/generate-questions-from-topic-data';
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
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const storedUserName = localStorage.getItem('userName');
            if (!storedUserName) {
                window.location.href = '/';
                return;
            }
            setUserName(storedUserName);
            
            const profile = await getUserProfile(storedUserName);
            setUserProfile(profile);
            if (profile?.learningContext) {
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
            setUserProfile(profile);
            
            toast({
                title: "Let's Get Started!",
                description: "We're creating a personalized test to get you started.",
            });
            
            if (profile.userId) {
                handleStartTest(profile.userId, "Percentages");
            }

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
    
    const handleStartTest = async (userId: string, topic: string) => {
        setView('loading');
        try {
            const testData = await generateQuestionsFromTopicData({
                topic: topic,
                numberOfQuestions: 5,
                userId: userId
            });
            
            const testId = crypto.randomUUID();
            
            setCurrentTest({ ...testData, topic: topic, testId});
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

    if (view === 'loading' || !userName) {
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
                    <CardDescription>Begin a test tailored to your needs.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <Button className="w-full max-w-xs rounded-full" onClick={() => handleStartTest(userName, 'Percentages')}>
                        Start Percentages Test
                    </Button>
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
