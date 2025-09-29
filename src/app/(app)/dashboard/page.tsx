

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Achievements from "@/components/dashboard/Achievements";
import LearningRecommendations from "@/components/dashboard/LearningRecommendations";
import OnboardingTour from "@/components/dashboard/OnboardingTour";
import ProgressOverview from "@/components/dashboard/ProgressOverview";


export default function DashboardPage() {
    return (
        <>
            <OnboardingTour />
             <div className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card id="start-test-step" className="lg:col-span-2">
                         <CardHeader>
                            <CardTitle>Start a New Test</CardTitle>
                            <CardDescription>Take a test tailored to your weak areas.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <p className="my-6 text-sm text-muted-foreground">
                                Our AI will generate a personalized test to help you focus on what matters most.
                            </p>
                            <Link href="/test/new/time-and-distance" className="w-full">
                                <Button className="w-full max-w-xs rounded-full">
                                    Start Personalized Test
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <div id="progress-overview-step" className="space-y-6">
                        <ProgressOverview />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Diagnostics</CardTitle>
                        <CardDescription>Drill down into your performance on specific topics.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 grid sm:grid-cols-2 gap-6">
                        <div className="flex flex-col items-start justify-center text-left p-6 border rounded-2xl bg-card shadow-sm">
                            <h3 className="font-semibold text-xl">Time & Distance</h3>
                            <p className="text-sm text-muted-foreground my-2 flex-1">View detailed report for this topic, or start a new test.</p>
                             <div className="flex gap-2">
                                <Link href="/dashboard/diagnostics/time-and-distance">
                                    <Button variant="outline" className="rounded-full">
                                        View Report
                                    </Button>
                                </Link>
                                 <Link href="/test/new/time-and-distance">
                                    <Button className="rounded-full">
                                        Start Test
                                    </Button>
                                </Link>
                            </div>
                        </div>
                         <div className="flex flex-col items-start justify-center text-left p-6 border rounded-2xl bg-card shadow-sm">
                            <h3 className="font-semibold text-xl">Percentages</h3>
                            <p className="text-sm text-muted-foreground my-2 flex-1">View detailed report for this topic, or start a new test.</p>
                            <div className="flex gap-2">
                                <Link href="/dashboard/diagnostics/percentages">
                                    <Button variant="outline" className="rounded-full">
                                        View Report
                                    </Button>
                                </Link>
                                 <Link href="/test/new/percentages">
                                    <Button className="rounded-full">
                                        Start Test
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="recommendations-step">
                        <LearningRecommendations />
                    </div>
                    <div id="achievements-step">
                        <Achievements />
                    </div>
                </div>
            </div>
        </>
    );
}
