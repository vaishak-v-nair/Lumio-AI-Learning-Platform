import DetailedDiagnosticReport from "@/components/dashboard/DetailedDiagnosticReport";

export default function DetailedDiagnosticPage({ params }: { params: { topic: string } }) {
  const topicName = params.topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Detailed Diagnostic Report: {topicName}</h1>
      <DetailedDiagnosticReport />
    </div>
  );
}
