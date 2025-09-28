import TestClient from '@/components/test/TestClient';

export default function TestPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-4xl py-2 sm:py-8">
      <TestClient testId={params.id} />
    </div>
  );
}
