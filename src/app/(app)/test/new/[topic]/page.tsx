
'use client';
import { useRouter } from 'next/navigation';
import { useEffect }from 'react';

// This page is deprecated. Test creation is now handled in the dashboard.
export default function NewTestTopicPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);
    
    return null;
}
