
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState, useRef, useCallback } from "react";
import { Award, BookOpen, Clock, Target, Upload, Camera } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ImageCropper, { type Area } from "@/components/ImageCropper";
import { getCroppedImg } from "@/lib/canvas-utils";

export default function ProfilePage() {
    const [userName, setUserName] = useState("Guest");
    const [bio, setBio] = useState("This is a placeholder bio. You can edit it by clicking the button below!");
    const [avatar, setAvatar] = useState(`https://picsum.photos/seed/Guest/128/128`);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCaptureDialogOpen, setIsCaptureDialogOpen] = useState(false);

    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { toast } = useToast();

    // Image Cropping state
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);


    useEffect(() => {
        if (typeof window !== 'undefined') {
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
        }
    }, []);

    const user = {
        name: userName,
        memberSince: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    const stats = [
        { label: "Tests Completed", value: "1", icon: <BookOpen className="h-6 w-6 text-primary" /> },
        { label: "Average Score", value: "85%", icon: <Target className="h-6 w-6 text-green-500" /> },
        { label: "Total Achievements", value: "3", icon: <Award className="h-6 w-6 text-amber-500" /> },
        { label: "Avg. Time / Question", value: "45s", icon: <Clock className="h-6 w-6 text-blue-500" /> },
    ];
    
    const handleSaveChanges = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newName = e.currentTarget.username.value;
        const newBio = e.currentTarget.bio.value;
        
        setUserName(newName);
        setBio(newBio);

        if (typeof window !== 'undefined') {
            localStorage.setItem('userName', newName);
            localStorage.setItem('userBio', newBio);
        }
        
        setIsDialogOpen(false);
    };

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSaveCroppedImage = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const objectURL = croppedImage; // This is already an object URL
            setAvatar(objectURL);
            
            // To store it in localStorage, we need to convert it to a data URL
            const response = await fetch(objectURL);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                 localStorage.setItem('userAvatar', reader.result as string);
            };
            reader.readAsDataURL(blob);

        } catch (e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Error Cropping Image',
                description: 'Something went wrong while cropping the image.'
            });
        } finally {
            setImageToCrop(null);
            setCroppedAreaPixels(null);
        }
    };


    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const openCaptureDialog = async () => {
        setIsCaptureDialogOpen(true);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error("Error accessing camera: ", error);
                setHasCameraPermission(false);
                toast({
                    variant: "destructive",
                    title: "Camera Access Denied",
                    description: "Please enable camera permissions in your browser settings."
                });
            }
        } else {
            setHasCameraPermission(false);
        }
    };

    const handleCaptureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/png');
                
                // Stop video stream
                const stream = video.srcObject as MediaStream;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }

                setIsCaptureDialogOpen(false);
                setImageToCrop(dataUrl);
            }
        }
    };


    return (
        <div className="space-y-6">
             {imageToCrop && (
                <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && setImageToCrop(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Crop Your Image</DialogTitle>
                            <DialogDescription>Adjust your image to the perfect size.</DialogDescription>
                        </DialogHeader>
                        <div className="relative h-64">
                            <ImageCropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setImageToCrop(null)}>Cancel</Button>
                            <Button onClick={handleSaveCroppedImage}>Save Crop</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

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
                                    <div className="space-y-2">
                                        <Label>Profile Picture</Label>
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline">
                                                <Label htmlFor="upload-avatar" className="cursor-pointer">
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Image
                                                </Label>
                                            </Button>
                                            <Input id="upload-avatar" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            <Dialog open={isCaptureDialogOpen} onOpenChange={setIsCaptureDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" onClick={openCaptureDialog}>
                                                        <Camera className="mr-2 h-4 w-4" />
                                                        Capture Image
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle>Capture Profile Photo</DialogTitle>
                                                        <DialogDescription>
                                                            Position yourself in the frame and click capture.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex flex-col items-center gap-4">
                                                        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                                                        <canvas ref={canvasRef} className="hidden" />
                                                        {hasCameraPermission === false && (
                                                            <Alert variant="destructive">
                                                                <AlertTitle>Camera Access Denied</AlertTitle>
                                                                <AlertDescription>
                                                                    Please grant camera permissions to use this feature.
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="ghost">Cancel</Button>
                                                        </DialogClose>
                                                        <Button onClick={handleCaptureImage} disabled={!hasCameraPermission}>Capture</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
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
