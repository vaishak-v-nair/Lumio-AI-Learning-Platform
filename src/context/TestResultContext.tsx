
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getLatestTestResult, type TestResult } from '@/lib/firestore';

interface TestResultContextType {
  latestResult: TestResult | null;
  isLoading: boolean;
  refreshResult: () => void;
}

const TestResultContext = createContext<TestResultContextType | undefined>(undefined);

export function TestResultProvider({ children }: { children: ReactNode }) {
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResult = useCallback(async () => {
    setIsLoading(true);
    const userName = localStorage.getItem('userName') || 'guest';
    
    // First, try to get from localStorage for immediate feedback on results page
    const localResult = localStorage.getItem('lastTestResult');
    if (localResult) {
        setLatestResult(JSON.parse(localResult));
    } else {
        // Fallback to Firestore for dashboard loading
        const result = await getLatestTestResult(userName, 'time-and-distance');
        setLatestResult(result);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  return (
    <TestResultContext.Provider value={{ latestResult, isLoading, refreshResult: fetchResult }}>
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

    