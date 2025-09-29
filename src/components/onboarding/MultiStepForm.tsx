
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createUserProfile } from '@/lib/firestore';
import { generatePersonalizedTest } from '@/ai/flows/generate-personalized-test';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../ui/label';

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) {
      toast({
        variant: 'destructive',
        title: 'Details required',
        description: 'Please tell us a bit about yourself to get started.',
      });
      return;
    }

    setIsLoading(true);
    const userName = localStorage.getItem('userName');
    if (!userName) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find user information. Please log in again.',
      });
      router.push('/');
      return;
    }

    try {
      await createUserProfile({
        userId: userName,
        userDetails: userDetails,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('onboardingComplete', 'true');

      const testData = await generatePersonalizedTest({
        userDetails: userDetails,
        weakAreas: 'Grasping,Retention,Application', // Initial test covers all areas
        numberOfQuestions: 5,
      });

      const testId = crypto.randomUUID();
      const topic = 'personalized-test'; // Generic topic for initial test
      sessionStorage.setItem(`test_${testId}`, JSON.stringify({ ...testData, topic }));

      toast({
        title: 'Profile created!',
        description: "We've created a personalized test to get you started.",
      });
      router.push(`/test/${testId}`);
    } catch (error) {
      console.error('Onboarding failed:', error);
      toast({
        variant: 'destructive',
        title: 'Onboarding Failed',
        description: 'Could not save your profile or generate a test. Please try again.',
      });
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep((s) => s + 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Crafting your personalized learning plan...</h2>
        <p className="text-muted-foreground mt-2">This may take a moment. Great things are coming!</p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      {step === 0 && (
        <div className="animate-fade-in">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-2">
              <Rocket className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Welcome to Lumio!</CardTitle>
            <CardDescription>Let's personalize your learning journey.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              Just one quick step to help us understand your needs.
            </p>
            <Button onClick={nextStep} size="lg" className="w-full max-w-xs mx-auto">Get Started</Button>
          </CardContent>
        </div>
      )}

      {step === 1 && (
         <form onSubmit={onSubmit} className="animate-fade-in">
            <CardHeader>
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full mt-1">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Tell Us About Yourself</CardTitle>
                        <CardDescription>This helps us tailor the experience just for you.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="user-details">Describe your learning context</Label>
                    <Textarea
                        id="user-details"
                        placeholder="e.g., I'm an 8th-grade student in the science stream. I'm interested in algebra and physics, and I learn best with visual examples."
                        className="min-h-[120px] text-base"
                        value={userDetails}
                        onChange={(e) => setUserDetails(e.target.value)}
                    />
                 </div>
                 <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Setting things up...' : 'Create My Learning Plan'}
                </Button>
            </CardContent>
         </form>
      )}
    </Card>
  );
}
