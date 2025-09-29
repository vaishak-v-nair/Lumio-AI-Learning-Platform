
'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page is deprecated. Test taking is now handled in the dashboard.
export default function TestPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return null;
}
