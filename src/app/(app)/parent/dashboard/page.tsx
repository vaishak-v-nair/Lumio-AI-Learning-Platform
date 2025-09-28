import PerformanceInsights from "@/components/dashboard/parent/PerformanceInsights";

export default function ParentDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Parent Dashboard</h1>
            <PerformanceInsights />
        </div>
    );
}
