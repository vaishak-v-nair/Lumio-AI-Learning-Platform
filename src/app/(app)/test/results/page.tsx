
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is deprecated. Results are now handled in the dashboard.
export default function TestResultsPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return null;
}
