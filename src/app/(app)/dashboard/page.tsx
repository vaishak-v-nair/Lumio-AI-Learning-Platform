import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, BarChart2 } from "lucide-react";
import Link from "next/link";
import ProgressOverview from "@/components/dashboard/ProgressOverview";
import DiagnosticReport from "@/components/dashboard/DiagnosticReport";
import Achievements from "@/components/dashboard/Achievements";
import LearningRecommendations from "@/components/dashboard/LearningRecommendations";
import { TestResultProvider } from "@/context/TestResultContext";
import OnboardingTour from "@/components/dashboard/OnboardingTour";

export default function DashboardPage() {
    return (
        <TestResultProvider>
            <OnboardingTour />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, let's continue your learning journey!</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card id="start-test-step" className="lg:col-span-1 flex flex-col">
                        <CardHeader className="pb-4">
                            <CardTitle>Start a New Test</CardTitle>
                            <CardDescription>Take a test tailored to your weak areas.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 items-center justify-center text-center p-6 pt-0">
                            <div className="p-6 bg-accent/20 rounded-full mb-4">
                                <Rocket className="w-12 h-12 text-accent" />
                            </div>
                            <p className="mb-4 text-sm text-muted-foreground flex-1">
                                Our AI will generate a personalized test to help you focus on what matters most.
                            </p>
                            <Link href="/test/new" className="w-full mt-auto">
                                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                    Start Personalized Test
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div id="progress-overview-step" className="lg:col-span-2">
                        <ProgressOverview />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div id="achievements-step">
                      <Achievements />
                    </div>
                    <div id="recommendations-step">
                      <LearningRecommendations />
                    </div>
                </div>

                <DiagnosticReport />

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Diagnostics</CardTitle>
                        <CardDescription>Drill down into your performance on specific topics.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border rounded-lg">
                                <BarChart2 className="w-12 h-12 text-primary mb-4" />
                                <h3 className="font-semibold">Time & Distance</h3>
                                <p className="text-sm text-muted-foreground mb-4">View detailed report for this topic.</p>
                                <Link href="/dashboard/diagnostics/time-and-distance" className="w-full max-w-xs mt-auto">
                                    <Button className="w-full">
                                        View Report
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </TestResultProvider>
    );
}
