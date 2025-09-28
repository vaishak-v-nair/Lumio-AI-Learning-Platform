
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getLatestTestResult, type TestResult } from '@/lib/firestore';

interface TestResultContextType {
  latestResult: TestResult | null;
  isLoading: boolean;
}

const TestResultContext = createContext<TestResultContextType | undefined>(undefined);

export function TestResultProvider({ children }: { children: ReactNode }) {
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      setIsLoading(true);
      const userName = localStorage.getItem('userName') || 'guest';
      const result = await getLatestTestResult(userName, 'time-and-distance');
      setLatestResult(result);
      setIsLoading(false);
    };

    fetchResult();
  }, []);

  return (
    <TestResultContext.Provider value={{ latestResult, isLoading }}>
      {children}
    </TestResultContext.Provider>
  );
}

export function useTestResult() {
  const context = useContext(TestResultContext);
  if (context === undefined) {
    throw new Error('useTestResult must be used within a TestResultProvider');
  }
  return context;
}
