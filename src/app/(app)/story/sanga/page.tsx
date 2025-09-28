import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, TrendingUp, Target } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SangaStoryPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <h1 className="text-4xl font-bold font-headline">Sanga's Learning Journey</h1>
                <p className="text-xl text-muted-foreground mt-2">From Struggle to Confidence</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>The Challenge: Initial Assessment</CardTitle>
                    <CardDescription>Sanga starts a new test on "Time & Distance".</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
                    <div className="space-y-2">
                        <p className="text-4xl font-bold">90s</p>
                        <p className="text-muted-foreground">Avg. time/question</p>
                    </div>
                     <div className="space-y-2">
                        <p className="text-4xl font-bold text-destructive">45%</p>
                        <p className="text-muted-foreground">Low Accuracy</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                 <ArrowRight className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>

            <Card className="bg-primary/5 border-primary">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="text-primary"/>AI-Powered Intervention</CardTitle>
                    <CardDescription>Lumio's AI identifies a retention and application gap from the slow and incorrect answers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">Personalized Plan:</p>
                    <ul className="list-disc list-inside text-muted-foreground mt-2">
                        <li>Focused micro-lessons on core concepts.</li>
                        <li>Timed practice drills to improve speed.</li>
                        <li>Adaptive questions that adjust to Sanga's pace.</li>
                    </ul>
                </CardContent>
            </Card>
            
            <div className="flex justify-center">
                 <ArrowRight className="h-8 w-8 text-muted-foreground animate-bounce" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>The Result: 2 Weeks Later</CardTitle>
                    <CardDescription>Sanga retakes the assessment with newfound confidence.</CardDescription>
                </CardHeader>
                 <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
                    <div className="space-y-2">
                        <p className="text-4xl font-bold">60s</p>
                        <p className="text-muted-foreground">Avg. time/question</p>
                    </div>
                     <div className="space-y-2">
                        <p className="text-4xl font-bold text-green-500">85%</p>
                        <p className="text-muted-foreground">Improved Accuracy</p>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            <div className="text-center p-6 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-10 w-10 text-green-500 mx-auto mb-2"/>
                <h3 className="text-2xl font-bold">A Confident Learner</h3>
                <p className="text-muted-foreground mt-2">
                   Sanga now not only knows the concepts, but can answer faster and more confidently.
                </p>
            </div>
        </div>
    );
}
