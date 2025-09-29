
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/lib/firestore';
import { cn } from '@/lib/utils';

type AuthAction = 'login' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authAction, setAuthAction] = useState<AuthAction>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) return;

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (authAction === 'signup') {
        const existingProfile = await getUserProfile(username);
        if (existingProfile) {
            toast({
                variant: 'destructive',
                title: 'Username Taken',
                description: 'This username is already in use. Please choose another one.',
            });
            setIsLoading(false);
            return;
        }

      toast({
          title: 'Account Created',
          description: 'You have successfully signed up. Please log in.',
      });
      setAuthAction('login');
      setIsLoading(false);
    } else {
      const name = authAction === 'login' ? (email.split('@')[0] || 'guest') : 'guest';
      localStorage.setItem('userName', name);
      
      const profile = await getUserProfile(name);

      if (profile) {
          localStorage.setItem('onboardingComplete', 'true');
      }
      router.push('/dashboard');
    }
  };

  return (
    <Card className="relative overflow-hidden h-[450px]">
        <div className={cn("transition-all duration-500 absolute w-full", authAction === 'login' ? 'opacity-100' : 'opacity-0 -translate-x-full')}>
            <CardHeader className="text-center">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                Enter your credentials to access your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAuthAction} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input id="email-login" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <Input id="password-login" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !isClient}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setAuthAction('signup')}>
                        Sign Up
                    </button>
                </p>
                </form>
            </CardContent>
        </div>

        <div className={cn("transition-all duration-500 absolute w-full", authAction === 'signup' ? 'opacity-100' : 'opacity-0 translate-x-full')}>
            <CardHeader className="text-center">
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                Enter your details below to create your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAuthAction} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username-signup">Username</Label>
                    <Input id="username-signup" type="text" placeholder="your_username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || !isClient}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign Up
                </Button>
                 <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setAuthAction('login')}>
                        Login
                    </button>
                </p>
                </form>
            </CardContent>
        </div>
    </Card>
  );
}
