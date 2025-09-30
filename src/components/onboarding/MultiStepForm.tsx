

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import type { UserProfile } from '@/lib/firestore';

export default function MultiStepForm({ onOnboardingComplete }: { onOnboardingComplete: (profile: UserProfile) => void }) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [interest, setInterest] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !education || !interest) return;

    setIsLoading(true);
    const userName = localStorage.getItem('userName');
    if (!userName) {
      window.location.href = '/';
      return;
    }

    const profile: UserProfile = {
      userId: userName,
      name: name,
      learningContext: `Education: ${education}, Interests: ${interest}`,
      createdAt: new Date().toISOString(),
    }
    
    onOnboardingComplete(profile);
  };

  const nextStep = () => setStep((s) => s + 1);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold">Crafting your personalized learning plan...</h2>
        <p className="text-muted-foreground mt-2">This may take a moment. Great things are coming!</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-full">
      <Card className="w-full max-w-lg mx-auto animate-fade-in-up">
        {step === 0 && (
          <>
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
          </>
        )}

        {step === 1 && (
          <form onSubmit={onSubmit}>
              <CardHeader>
                  <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-full mt-1">
                          <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                          <CardTitle>Tell Us About Yourself</CardTitle>
                          <CardDescription>This helps our AI tailor the experience just for you.</CardDescription>
                      </div>
                  </div>
              </CardHeader>
              <CardContent className="space-y-6">
                   <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                          id="name"
                          placeholder="e.g., Sanga"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                      />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <Input
                          id="education"
                          placeholder="e.g., 10th Grade, Science Stream"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          required
                      />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="interest">Area of Interest</Label>
                      <Input
                          id="interest"
                          placeholder="e.g., Space, Astrophysics, History"
                          value={interest}
                          onChange={(e) => setInterest(e.target.value)}
                          required
                      />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={!name || !education || !interest}>
                      {isLoading ? 'Setting things up...' : 'Create My Learning Plan'}
                  </Button>
              </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
}
