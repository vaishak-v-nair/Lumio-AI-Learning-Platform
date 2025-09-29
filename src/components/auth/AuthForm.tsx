
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getUserProfile } from '@/lib/firestore';

export default function AuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAuthAction = async (e: React.FormEvent, action: 'login' | 'signup' | 'guest') => {
    e.preventDefault();
    if (!isClient) return;

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (action === 'signup') {
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
      setActiveTab('login');
      setIsLoading(false);
    } else {
      const name = action === 'guest' ? 'Guest' : email.split('@')[0];
      localStorage.setItem('userName', name);
      
      // Check if user has completed onboarding
      const profile = await getUserProfile(name);

      if (profile) {
          localStorage.setItem('onboardingComplete', 'true');
          router.push('/dashboard');
      } else {
          router.push('/dashboard');
      }
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card className="border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleAuthAction(e, 'login')} className="space-y-4">
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
              <Button onClick={(e) => handleAuthAction(e, 'guest')} variant="outline" className="w-full" disabled={isLoading || !isClient}>
                Continue as Guest
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card className="border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>
              Enter your details below to create your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleAuthAction(e, 'signup')} className="space-y-4">
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
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
