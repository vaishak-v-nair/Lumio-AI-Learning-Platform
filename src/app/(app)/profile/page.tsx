
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Award, BookOpen, Clock, Target } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const [userName, setUserName] = useState("Guest");

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('userName');
            if (storedName) {
                setUserName(storedName);
            }
        }
    }, []);

    const user = {
        name: userName,
        email: `${userName.toLowerCase()}@example.com`,
        avatar: `https://picsum.photos/seed/${userName}/128/128`,
        memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const stats = [
        { label: "Tests Completed", value: "1", icon: <BookOpen className="h-6 w-6 text-primary" /> },
        { label: "Average Score", value: "85%", icon: <Target className="h-6 w-6 text-green-500" /> },
        { label: "Total Achievements", value: "3", icon: <Award className="h-6 w-6 text-amber-500" /> },
        { label: "Avg. Time / Question", value: "45s", icon: <Clock className="h-6 w-6 text-blue-500" /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">My Profile</h1>
                <p className="text-muted-foreground">View and manage your profile information.</p>
            </div>
            
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={user.avatar} alt="User avatar" />
                        <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-semibold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <p className="text-sm text-muted-foreground mt-2">Member since {user.memberSince}</p>
                        <Button variant="outline" className="mt-4">Edit Profile</Button>
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
