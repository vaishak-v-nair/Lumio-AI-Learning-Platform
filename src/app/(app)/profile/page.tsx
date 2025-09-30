

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef, useCallback } from "react";
import { Award, BookOpen, Clock, Target, Upload, Camera } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageCropper, { Area } from '@/components/ImageCropper';
import { getCroppedImg } from '@/lib/canvas-utils';
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserProfile, createUserProfile } from "@/lib/firestore";
import type { UserProfile } from "@/lib/firestore";

type Stat = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

export default function ProfilePage() {
    const [displayName, setDisplayName] = useState("Guest");
    const [username, setUsername] = useState("guest");
    const [bio, setBio] = useState("This is a placeholder bio. You can edit it by clicking the button below!");
    const [avatar, setAvatar] = useState(`https://picsum.photos/seed/Guest/128/128`);
    const [isClient, setIsClient] = useState(false);
    const [memberSince, setMemberSince] = useState('');
    const [stats, setStats] = useState<Stat[]>([]);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isTakingPhoto, setIsTakingPhoto] = useState(false);

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
            });
            reader.readAsDataURL(file);
        }
    };
    
    useEffect(() => {
        setIsClient(true);
        const loadProfile = async () => {
            setIsLoadingStats(true);
            const storedUsername = localStorage.getItem('userName');
            if (storedUsername) {
                setUsername(storedUsername);
                const profile = await getUserProfile(storedUsername);
                if (profile) {
                    setDisplayName(profile.name || storedUsername);
                    setBio(profile.bio || "This is a placeholder bio. You can edit it by clicking the button below!");
                    setAvatar(profile.avatarUrl || `https://picsum.photos/seed/${storedUsername}/128/128`);
                    setMemberSince(profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A');

                    // Calculate stats from full history
                    const testsCompleted = profile.performanceHistory?.length || 0;
                    const totalScore = profile.performanceHistory?.reduce((acc, test) => acc + test.score, 0) || 0;
                    const averageScore = testsCompleted > 0 ? Math.round(totalScore / testsCompleted) : 0;
                    
                    const earnedAchievements = new Set<string>();
                    if (testsCompleted > 0) earnedAchievements.add('first_test');
                    // In a real app, you'd have more complex logic for achievements.
                    // For now, let's grant one for high average score.
                    if (averageScore >= 85) earnedAchievements.add('topic_master');
                    if (testsCompleted >= 5) earnedAchievements.add('streak_5');

                    // NOTE: Avg time per question is complex to calculate historically without more data.
                    // We'll keep it based on the last test for now, or show N/A.
                    const lastTestTime = profile.performanceHistory && profile.performanceHistory.length > 0
                        ? 'N/A' // This data isn't in performanceHistory, would need to fetch full test result.
                        : 'N/A';

                    setStats([
                        { label: "Tests Completed", value: testsCompleted.toString(), icon: <BookOpen className="h-6 w-6 text-primary" /> },
                        { label: "Average Score", value: `${averageScore}%`, icon: <Target className="h-6 w-6 text-green-500" /> },
                        { label: "Total Achievements", value: earnedAchievements.size.toString(), icon: <Award className="h-6 w-6 text-amber-500" /> },
                        { label: "Avg. Time / Question", value: lastTestTime, icon: <Clock className="h-6 w-6 text-blue-500" /> },
                    ]);

                } else {
                     setAvatar(`https://picsum.photos/seed/${storedUsername}/128/128`);
                     setStats([
                        { label: "Tests Completed", value: "0", icon: <BookOpen className="h-6 w-6 text-primary" /> },
                        { label: "Average Score", value: "N/A", icon: <Target className="h-6 w-6 text-green-500" /> },
                        { label: "Total Achievements", value: "0", icon: <Award className="h-6 w-6 text-amber-500" /> },
                        { label: "Avg. Time / Question", value: "N/A", icon: <Clock className="h-6 w-6 text-blue-500" /> },
                    ]);
                }
            }
             setIsLoadingStats(false);
        };

        loadProfile();
        
        const storedAvatar = localStorage.getItem('userAvatar');
         if (storedAvatar) {
            setAvatar(storedAvatar);
        }
    }, []);
    
    useEffect(() => {
        const getCameraPermission = async () => {
          if (!isAvatarDialogOpen || !isTakingPhoto) return;
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings to use this feature.',
            });
          }
        };
    
        getCameraPermission();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [isAvatarDialogOpen, isTakingPhoto, toast]);

    const user = {
        name: displayName,
        memberSince: memberSince
    };
    
    const handleSaveChanges = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newName = e.currentTarget.name.value;
        const newBio = e.currentTarget.bio.value;
        
        setDisplayName(newName);
        setBio(newBio);

        const profileUpdate: Partial<UserProfile> = {
            name: newName,
            bio: newBio,
        };
        
        await createUserProfile({ userId: username, ...profileUpdate });
        window.dispatchEvent(new Event('storage')); // Notify layout of name change

        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully saved.",
        });
        
        setIsEditProfileOpen(false);
    };

    const handleSaveAvatar = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsCropping(true);
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            const downloadURL = croppedImage; 

            setAvatar(downloadURL);
            localStorage.setItem('userAvatar', downloadURL);
            await createUserProfile({ userId: username, avatarUrl: downloadURL });

            window.dispatchEvent(new Event('storage'));
            setIsAvatarDialogOpen(false);
            resetAvatarDialog();
        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Error Saving Avatar',
                description: 'Something went wrong while saving the avatar. Please try again.'
            });
        } finally {
            setIsCropping(false);
        }
    };
    
    const handleTakePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setImageSrc(dataUrl);
                setIsTakingPhoto(false);
            }
        }
    }

    const resetAvatarDialog = () => {
        setImageSrc(null);
        setIsTakingPhoto(false);
        setHasCameraPermission(null);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }


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
                    <Dialog open={isAvatarDialogOpen} onOpenChange={(isOpen) => {
                        setIsAvatarDialogOpen(isOpen);
                        if (!isOpen) resetAvatarDialog();
                    }}>
                        <DialogTrigger asChild>
                            <button className="relative group">
                                <Avatar className="h-32 w-32">
                                    <AvatarImage src={avatar} alt="User avatar" />
                                    <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Update Profile Picture</DialogTitle>
                                <DialogDescription>
                                    Upload a new photo, or take one with your camera.
                                </DialogDescription>
                            </DialogHeader>
                            {imageSrc ? (
                                <div className="space-y-4">
                                    <div className="relative h-64 w-full bg-muted rounded-md">
                                        <ImageCropper
                                            image={imageSrc}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={1}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onCropComplete={onCropComplete}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Zoom</Label>
                                        <Slider
                                            value={[zoom]}
                                            min={1}
                                            max={3}
                                            step={0.1}
                                            onValueChange={(val) => setZoom(val[0])}
                                        />
                                    </div>
                                </div>
                            ) : isTakingPhoto ? (
                                <div className="space-y-4">
                                    <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                                    {hasCameraPermission === false && (
                                        <Alert variant="destructive">
                                            <AlertTitle>Camera Access Required</AlertTitle>
                                            <AlertDescription>
                                                Please allow camera access to use this feature.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                     <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Photo
                                    </Button>
                                    <Input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                    <Button variant="outline" onClick={() => setIsTakingPhoto(true)}>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Use Camera
                                    </Button>
                                </div>
                            )}

                            <DialogFooter>
                                {imageSrc ? (
                                     <>
                                        <Button variant="ghost" onClick={() => resetAvatarDialog()}>Back</Button>
                                        <Button onClick={handleSaveAvatar} disabled={isCropping}>
                                            {isCropping ? 'Saving...' : 'Save Avatar'}
                                        </Button>
                                     </>
                                ) : isTakingPhoto ? (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsTakingPhoto(false)}>Back</Button>
                                        <Button onClick={handleTakePhoto} disabled={hasCameraPermission === false}>Take Photo</Button>
                                    </>
                                ): null}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-semibold">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">@{username}</p>
                        <p className="text-muted-foreground italic mt-2">"{bio}"</p>
                        <p className="text-sm text-muted-foreground mt-2">Member since {user.memberSince}</p>

                        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
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
                                        <Input id="username" value={username} disabled />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input id="name" defaultValue={displayName} />
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
                    {isLoadingStats ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[...Array(4)].map((_, index) => (
                                <Card key={index}>
                                    <CardContent className="p-6 flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div>
                                            <Skeleton className="h-7 w-16" />
                                            <Skeleton className="h-4 w-24 mt-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
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
                    )}
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

    