
'use client';

import { useState, useEffect } from 'react';
import type { TestResult } from '@/lib/firestore';

export function useTestResultData() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem('lastTestResult');
    if (data) {
      setResult(JSON.parse(data));
    }
    setIsLoading(false);
  }, []);

  return { result, isLoading };
}

    