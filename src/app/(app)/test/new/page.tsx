

'use client';

import { generateQuestionsFromTopicData } from '@/ai/flows/generate-questions-from-topic-data';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function NewTestPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [status, setStatus] = useState('Preparing your test...');

    const topic = Array.isArray(params.topic) ? params.topic[0] : params.topic;

    useEffect(() => {
        const createTest = async () => {
             if (!topic) {
                toast({
                    variant: 'destructive',
                    title: 'No Topic Specified',
                    description: 'Please select a topic to start a test.',
                });
                router.push('/dashboard');
                return;
            }

            const topicName = topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            try {
                setStatus(`Generating personalized questions for ${topicName}...`);
                const testData = await generateQuestionsFromTopicData({
                    topic: topicName,
                    numberOfQuestions: 5,
                });
                
                const testId = crypto.randomUUID();
                
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(`test_${testId}`, JSON.stringify({...testData, topic: topic}));
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
    }, [router, toast, topic]);
    
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Building Your Test</h2>
            <p className="text-muted-foreground">{status}</p>
        </div>
    );
}
