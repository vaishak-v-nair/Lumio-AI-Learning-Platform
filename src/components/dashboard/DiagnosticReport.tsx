'use client';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { useUserProgress } from "@/hooks/use-user-progress";

const chartConfig = {
  listening: { label: "Listening", color: "hsl(var(--chart-1))" },
  grasping: { label: "Grasping", color: "hsl(var(--chart-2))" },
  retention: { label: "Retention", color: "hsl(var(--chart-3))" },
  application: { label: "Application", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

export default function DiagnosticReport() {
    const { learningTrends: chartData, trending } = useUserProgress();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Learning Trends</CardTitle>
                <CardDescription>Your progress over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="listening" fill="var(--color-listening)" radius={4} />
                        <Bar dataKey="grasping" fill="var(--color-grasping)" radius={4} />
                        <Bar dataKey="retention" fill="var(--color-retention)" radius={4} />
                        <Bar dataKey="application" fill="var(--color-application)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by {trending}% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total scores for the last 6 months
                </div>
            </CardFooter>
        </Card>
    );
}
