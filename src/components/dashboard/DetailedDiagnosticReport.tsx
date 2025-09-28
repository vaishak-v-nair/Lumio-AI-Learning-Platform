"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { useDetailedDiagnostics } from "@/hooks/use-detailed-diagnostics"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { FileQuestion } from "lucide-react"

const chartConfig = {
    accuracy: { label: "Accuracy", color: "hsl(var(--chart-1))" },
    time: { label: "Avg. Time (s)", color: "hsl(var(--chart-2))" },
}

export default function DetailedDiagnosticReport() {
    const { performanceData, timeVsAccuracyData, radarChartData, isLoading, hasData } = useDetailedDiagnostics();
  
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-56 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-56 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!hasData) {
        return (
            <Alert>
                <FileQuestion className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                    There is no diagnostic data available for this topic yet. Take a test to see your report.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your fundamentals for this topic.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fundamental</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Avg. Response Time</TableHead>
                    <TableHead>Assessment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((item) => (
                    <TableRow key={item.fundamental}>
                      <TableCell className="font-medium">{item.fundamental}</TableCell>
                      <TableCell>{item.accuracy}% <span className="ml-2">{item.icon}</span></TableCell>
                      <TableCell>{item.avgResponseTime}s/question</TableCell>
                      <TableCell>{item.assessment}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Fundamentals Overview</CardTitle>
                    <CardDescription>Radar chart visualizing your core strengths.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <RadarChart data={radarChartData}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} />
                            <Radar name="Score" dataKey="score" fill="var(--color-accuracy)" fillOpacity={0.6} stroke="var(--color-accuracy)" />
                        </RadarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Time vs. Accuracy</CardTitle>
                    <CardDescription>Comparison of response time and accuracy.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={timeVsAccuracyData} layout="vertical" margin={{left: 10}}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="Accuracy" fill="var(--color-accuracy)" radius={5}>
                                 <LabelList dataKey="Accuracy" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `${value}%`} />
                            </Bar>
                            <Bar dataKey="Avg. Time (s)" fill="var(--color-time)" radius={5}>
                                <LabelList dataKey="Avg. Time (s)" position="right" offset={8} className="fill-foreground" fontSize={12} formatter={(value: number) => `${value}s`} />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
          </div>
        </div>
      );
}
