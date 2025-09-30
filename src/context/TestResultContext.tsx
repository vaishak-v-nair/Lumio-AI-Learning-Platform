
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

  const fetchResult = useCallback(async (topic?: string) => {
    // If we already have data, don't re-fetch unless forced.
    if (latestResult && !topic) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const userName = localStorage.getItem('userName') || 'guest';
    
    // On the results page, we want immediate feedback.
    const isResultsPage = typeof window !== 'undefined' && window.location.pathname.includes('/test/results');

    if (isResultsPage) {
        const localResult = localStorage.getItem('lastTestResult');
        if (localResult) {
            const parsedResult = JSON.parse(localResult);
            setLatestResult(parsedResult);
            setIsLoading(false);
            return;
        }
    }
    
    // For all other pages, or if local storage is empty, fetch from Firestore.
    const result = await getLatestTestResult(userName, topic);
    setLatestResult(result);
    if (result) {
        // Also update local storage if we fetched from firestore
        localStorage.setItem('lastTestResult', JSON.stringify(result));
    }
    
    setIsLoading(false);
  }, [latestResult]);


  useEffect(() => {
    // On initial load, try to get the topic from the URL if available
    const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
    const topic = pathParts.includes('diagnostics') ? pathParts[pathParts.length - 1] : undefined;
    fetchResult(topic);
    // The dependency array is intentionally sparse to only run on initial load and when the function itself changes.
    // We control re-fetching with the refreshResult callback.
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
