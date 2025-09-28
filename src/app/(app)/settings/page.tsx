
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Palette, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your preferences have been updated successfully.",
        });
    };
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold font-headline">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </div>

            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette /> Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                            <span>Dark Mode</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Enable dark mode for a different visual experience.
                            </span>
                        </Label>
                        <Switch id="dark-mode" onClick={() => document.documentElement.classList.toggle('dark')} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell /> Notifications</CardTitle>
                    <CardDescription>Manage how you receive notifications.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                            <span>Email Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Receive summaries and updates via email.
                            </span>
                        </Label>
                        <Switch id="email-notifications" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                            <span>Push Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Get real-time alerts in your browser.
                            </span>
                        </Label>
                        <Switch id="push-notifications" />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> Account</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <Button variant="outline">Change Password</Button>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
        </div>
    );
}
