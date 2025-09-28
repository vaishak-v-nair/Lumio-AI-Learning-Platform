
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
    
    // On the results page, we want immediate feedback.
    // The `useTestResultData` hook handles loading from localStorage for that specific page.
    // For all other pages (Dashboard, Profile), we should fetch from Firestore to get the true latest result.
    const isResultsPage = window.location.pathname.includes('/test/results');

    if (isResultsPage) {
        const localResult = localStorage.getItem('lastTestResult');
        if (localResult) {
            setLatestResult(JSON.parse(localResult));
            setIsLoading(false);
            return;
        }
    }
    
    // For all other pages, or if local storage is empty, fetch from Firestore.
    const result = await getLatestTestResult(userName, 'time-and-distance');
    setLatestResult(result);
    if (result) {
        // Also update local storage if we fetched from firestore
        localStorage.setItem('lastTestResult', JSON.stringify(result));
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
