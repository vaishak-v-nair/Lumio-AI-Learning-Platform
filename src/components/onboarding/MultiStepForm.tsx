
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserProfile } from '@/lib/firestore';
import { generatePersonalizedTest } from '@/ai/flows/generate-personalized-test';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Rocket } from 'lucide-react';

const formSchema = z.object({
  educationLevel: z.string().min(1, 'Please select your education level.'),
  stream: z.string().min(1, 'Please select your academic stream.'),
  interests: z.string().min(2, 'Please tell us at least one area of interest.'),
});

type FormData = z.infer<typeof formSchema>;

export default function MultiStepForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      educationLevel: '',
      stream: '',
      interests: '',
    },
  });

  const onSubmit = async (data: FormData) => {
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
      // 1. Create user profile in Firestore
      await createUserProfile({
        userId: userName,
        ...data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('onboardingComplete', 'true');

      // 2. Generate personalized test
      const testData = await generatePersonalizedTest({
        educationLevel: data.educationLevel,
        stream: data.stream,
        interests: data.interests,
        weakAreas: 'Grasping,Retention,Application', // Initial test covers all areas
        numberOfQuestions: 5,
      });
      
      const testId = crypto.randomUUID();
      sessionStorage.setItem(`test_${testId}`, JSON.stringify({...testData, topic: data.interests}));

      // 3. Redirect to the first test
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

  if (step === 0) {
      return (
           <Card className="text-center">
                <CardHeader className="items-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-2">
                        <Rocket className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Welcome to Lumio!</CardTitle>
                    <CardDescription>Let's personalize your learning journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Just a few quick questions to help us understand your needs.
                    </p>
                    <Button onClick={nextStep}>Get Started</Button>
                </CardContent>
            </Card>
      )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Yourself</CardTitle>
            <CardDescription>This will help us tailor the experience just for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="educationLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your grade or level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Middle School (6-8)">Middle School (6-8)</SelectItem>
                      <SelectItem value="High School (9-10)">High School (9-10)</SelectItem>
                      <SelectItem value="Senior Secondary (11-12)">Senior Secondary (11-12)</SelectItem>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Stream</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your academic stream" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts/Humanities">Arts/Humanities</SelectItem>
                      <SelectItem value="General">General/Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Areas of Interest</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Algebra, Physics, Literature" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Setting things up...' : 'Create My Learning Plan'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
