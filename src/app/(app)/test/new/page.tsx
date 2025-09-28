
'use client';

import { generateQuestionsFromTopicData } from '@/ai/flows/generate-questions-from-topic-data';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewTestPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [status, setStatus] = useState('Generating personalized questions...');

    useEffect(() => {
        const createTest = async () => {
            try {
                setStatus('Generating personalized questions for Time & Distance...');
                const testData = await generateQuestionsFromTopicData({
                    topic: 'Time & Distance',
                    numberOfQuestions: 5,
                });
                
                const testId = crypto.randomUUID();
                
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(`test_${testId}`, JSON.stringify(testData));
                }

                setStatus('Redirecting to your test...');
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
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Building Your Test</h2>
            <p className="text-muted-foreground">{status}</p>
        </div>
    );
}
