
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Award, BookOpen, Clock, Target } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTestResult } from "@/context/TestResultContext";

type Stat = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

export default function ProfilePage() {
    const [userName, setUserName] = useState("Guest");
    const [bio, setBio] = useState("This is a placeholder bio. You can edit it by clicking the button below!");
    const [avatar, setAvatar] = useState(`https://picsum.photos/seed/Guest/128/128`);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [memberSince, setMemberSince] = useState('');
    const [stats, setStats] = useState<Stat[]>([]);

    const { latestResult: results, isLoading } = useTestResult();

    useEffect(() => {
        setIsClient(true);
        const storedName = localStorage.getItem('userName');
        if (storedName) {
            setUserName(storedName);
        }
        const storedBio = localStorage.getItem('userBio');
        if (storedBio) {
            setBio(storedBio);
        }
        const storedAvatar = localStorage.getItem('userAvatar');
         if (storedAvatar) {
            setAvatar(storedAvatar);
        } else {
            setAvatar(`https://picsum.photos/seed/${storedName || 'Guest'}/128/128`);
        }
        setMemberSince(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    useEffect(() => {
        if (results) {
            const averageScore = Math.round(results.score);
            const avgTime = Math.round(results.timings.reduce((a, b) => a + b, 0) / results.timings.length);
            
            const earnedAchievements = [];
            if (results.score >= 90) earnedAchievements.push('mastered_topic');
            const allFast = results.timings.every((t: number) => t < 30);
            if (allFast) earnedAchievements.push('quick_thinker');
            earnedAchievements.push('streak_5'); // Mocked
            earnedAchievements.push('first_test');

            setStats([
                { label: "Tests Completed", value: "1", icon: <BookOpen className="h-6 w-6 text-primary" /> },
                { label: "Average Score", value: `${averageScore}%`, icon: <Target className="h-6 w-6 text-green-500" /> },
                { label: "Total Achievements", value: `${earnedAchievements.length}`, icon: <Award className="h-6 w-6 text-amber-500" /> },
                { label: "Avg. Time / Question", value: `${avgTime}s`, icon: <Clock className="h-6 w-6 text-blue-500" /> },
            ]);
        } else {
             setStats([
                { label: "Tests Completed", value: "0", icon: <BookOpen className="h-6 w-6 text-primary" /> },
                { label: "Average Score", value: "N/A", icon: <Target className="h-6 w-6 text-green-500" /> },
                { label: "Total Achievements", value: "0", icon: <Award className="h-6 w-6 text-amber-500" /> },
                { label: "Avg. Time / Question", value: "N/A", icon: <Clock className="h-6 w-6 text-blue-500" /> },
            ]);
        }
    }, [results]);

    const user = {
        name: userName,
        memberSince: memberSince
    };
    
    const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newName = e.currentTarget.username.value;
        const newBio = e.currentTarget.bio.value;
        
        setUserName(newName);
        setBio(newBio);

        localStorage.setItem('userName', newName);
        localStorage.setItem('userBio', newBio);

        const newAvatar = `https://picsum.photos/seed/${newName}/128/128`;
        setAvatar(newAvatar);
        localStorage.setItem('userAvatar', newAvatar);
        
        setIsDialogOpen(false);
    };

    if (!isClient) {
        return <div className="mx-auto w-full max-w-4xl space-y-6">
             <div>
                <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information.</p>
            </div>
        </div>;
    }

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information.</p>
            </div>
            
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={avatar} alt="User avatar" />
                        <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-semibold">{user.name}</h2>
                        <p className="text-muted-foreground italic mt-2">"{bio}"</p>
                        <p className="text-sm text-muted-foreground mt-2">Member since {user.memberSince}</p>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="mt-4">Edit Profile</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Make changes to your profile here. Click save when you're done.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSaveChanges} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" defaultValue={userName} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea id="bio" defaultValue={bio} />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <Separator />
            
             <Card>
                <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                    <CardDescription>An overview of your learning journey so far.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat, index) => (
                            <Card key={index}>
                                <CardContent className="p-6 flex items-center gap-4">
                                     <div className="p-3 bg-secondary rounded-full">
                                         {stat.icon}
                                     </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
                 <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}
