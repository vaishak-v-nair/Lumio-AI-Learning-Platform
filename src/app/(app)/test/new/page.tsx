'use client';

import { generatePersonalizedTest } from '@/ai/flows/generate-personalized-test';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewTestPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState('Analyzing your profile...');

    useEffect(() => {
        const createTest = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                setStatus('Identifying weak areas...');
                const weakAreas = 'Listening, Grasping, Retention, Application';
                await new Promise(resolve => setTimeout(resolve, 1500));

                setStatus('Generating personalized questions for Time & Distance...');
                const testData = await generatePersonalizedTest({
                    weakAreas,
                    numberOfQuestions: 5,
                });
                
                const testId = crypto.randomUUID();
                
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(`test_${testId}`, JSON.stringify(testData));
                }

                setStatus('Redirecting to your test...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                router.push(`/test/${testId}`);

            } catch (error) {
                console.error('Failed to generate test:', error);
                toast({
                    variant: 'destructive',
                    title: 'Test Generation Failed',
                    description: 'Could not create a personalized test. Please try again later.',
                });
                router.push('/dashboard');
            }
        };

        createTest();
    }, [router, toast]);
    
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Building Your Test</h2>
            <p className="text-muted-foreground">{status}</p>
        </div>
    );
}
