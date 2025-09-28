
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, BarChart, Trophy, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';


const tourSteps = [
    {
        id: 'welcome-step',
        icon: <Rocket className="h-10 w-10 text-primary" />,
        title: 'Welcome to Lumio!',
        description: "Let's take a quick tour to see how Lumio can help you master new skills.",
    },
    {
        id: 'start-test-step',
        icon: <Rocket className="h-10 w-10 text-accent" />,
        title: 'Start a Personalized Test',
        description: "Our AI generates tests tailored to your weak areas. This is the best place to start your learning journey.",
    },
    {
        id: 'progress-overview-step',
        icon: <BarChart className="h-10 w-10 text-primary" />,
        title: 'Track Your Progress',
        description: "See an overview of your core learning skills and watch them improve over time.",
    },
    {
        id: 'achievements-step',
        icon: <Trophy className="h-10 w-10 text-amber-500" />,
        title: 'Earn Achievements',
        description: "Stay motivated by earning badges for your accomplishments and milestones.",
    },
    {
        id: 'recommendations-step',
        icon: <Sparkles className="h-10 w-10 text-primary" />,
        title: 'Get AI Recommendations',
        description: "Receive personalized suggestions from our AI to help you focus on what matters most.",
    },
    {
        id: 'finish-step',
        icon: <Check className="h-10 w-10 text-green-500" />,
        title: "You're All Set!",
        description: "You're ready to start your personalized learning journey. Good luck!",
    },
];

export default function OnboardingTour() {
    const [isClient, setIsClient] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        setIsClient(true);
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (!onboardingComplete) {
            setIsOpen(true);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            finishTour();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const finishTour = () => {
        localStorage.setItem('onboardingComplete', 'true');
        setIsOpen(false);
    }

    if (!isClient || !isOpen) {
        return null;
    }

    const step = tourSteps[currentStep];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) finishTour(); }}>
            <DialogContent 
                className="sm:max-w-md"
                onInteractOutside={(e) => { e.preventDefault(); }}
                onEscapeKeyDown={finishTour}
                hideCloseButton={true}
            >
                <DialogHeader className="text-center items-center pt-4">
                    <div className="p-3 bg-secondary rounded-full mb-2">
                        {step.icon}
                    </div>
                    <DialogTitle className="text-2xl">{step.title}</DialogTitle>
                    <DialogDescription>{step.description}</DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center space-x-2 my-4">
                    {tourSteps.map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                'h-2 w-2 rounded-full transition-all',
                                currentStep === index ? 'w-4 bg-primary' : 'bg-muted'
                            )}
                        />
                    ))}
                </div>
                <DialogFooter className={cn("sm:justify-between flex-row items-center", currentStep === 0 && "sm:justify-end justify-end")}>
                     {currentStep > 0 && (
                        <Button variant="ghost" onClick={handlePrevious}>Previous</Button>
                    )}
                    <div className="flex-grow" />
                    {currentStep < tourSteps.length - 1 && (
                         <Button variant="link" onClick={finishTour}>Skip Tour</Button>
                    )}
                    <Button onClick={handleNext}>
                        {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
