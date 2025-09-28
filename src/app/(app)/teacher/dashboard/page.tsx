import ResponseTimeHeatmap from "@/components/dashboard/teacher/ResponseTimeHeatmap";

export default function TeacherDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Teacher Dashboard</h1>
            <ResponseTimeHeatmap />
        </div>
    );
}
