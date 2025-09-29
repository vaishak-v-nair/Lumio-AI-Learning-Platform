
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
import { getUserProfile, createUserProfile } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

type AuthAction = 'login' | 'signup';

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authAction, setAuthAction] = useState<AuthAction>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validate = () => {
    let isValid = true;
    setUsernameError('');
    setPasswordError('');

    if (authAction === 'signup') {
        const usernameRegex = /^[a-zA-Z0-9]{3,15}$/;
        if (!usernameRegex.test(username)) {
            setUsernameError('Username must be 3-15 alphanumeric characters.');
            isValid = false;
        }
    }
    
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }
    return isValid;
  }

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient || !validate()) return;

    setIsLoading(true);

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
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: username });
            
            // We will create the profile after the onboarding step.
            // await createUserProfile({ userId: username });

            localStorage.setItem('userName', username);
            localStorage.setItem('userUID', user.uid);
            
            router.push('/dashboard');
        } catch (error: any) {
            console.error("Signup error", error);
             toast({
                variant: 'destructive',
                title: 'Sign Up Failed',
                description: error.message || 'An unexpected error occurred.',
            });
            setIsLoading(false);
        }

    } else { // Login
       try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userName = user.displayName;

            if (userName) {
                 localStorage.setItem('userName', userName);
                 localStorage.setItem('userUID', user.uid);
                 const profile = await getUserProfile(userName);
                 if (profile) {
                    localStorage.setItem('onboardingComplete', 'true');
                 }
                 router.push('/dashboard');
            } else {
                // This case can happen if displayName is not set on an existing user.
                // We'll treat the part before the @ as the username.
                const fallbackName = user.email?.split('@')[0] || 'guest';
                localStorage.setItem('userName', fallbackName);
                localStorage.setItem('userUID', user.uid);
                router.push('/dashboard');
            }

       } catch (error: any) {
            console.error("Login error", error);
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: "Invalid email or password. Please try again.",
            });
            setIsLoading(false);
       }
    }
  };

  return (
    <Card className="relative overflow-hidden h-auto animate-fade-in-up">
        <div className={cn("transition-all duration-500 w-full", authAction === 'login' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
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
                    <Input id="password-login" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                     {passwordError && authAction === 'login' && <p className="text-xs text-destructive">{passwordError}</p>}
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

        <div className={cn("transition-all duration-500 w-full", authAction === 'signup' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden')}>
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
                    {usernameError && <p className="text-xs text-destructive">{usernameError}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    {passwordError && authAction === 'signup' && <p className="text-xs text-destructive">{passwordError}</p>}
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
