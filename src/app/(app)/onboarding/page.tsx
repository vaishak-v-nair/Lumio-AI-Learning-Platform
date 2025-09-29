
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is deprecated and the logic is now handled in the dashboard.
export default function OnboardingPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return null;
}
