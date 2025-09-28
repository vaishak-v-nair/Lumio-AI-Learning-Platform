
'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, BarChart, Trophy, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


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
        targetId: 'start-test-step',
    },
    {
        id: 'progress-overview-step',
        icon: <BarChart className="h-10 w-10 text-primary" />,
        title: 'Track Your Progress',
        description: "See an overview of your core learning skills and watch them improve over time.",
        targetId: 'progress-overview-step',
    },
    {
        id: 'achievements-step',
        icon: <Trophy className="h-10 w-10 text-amber-500" />,
        title: 'Earn Achievements',
        description: "Stay motivated by earning badges for your accomplishments and milestones.",
        targetId: 'achievements-step',
    },
    {
        id: 'recommendations-step',
        icon: <Sparkles className="h-10 w-10 text-primary" />,
        title: 'Get AI Recommendations',
        description: "Receive personalized suggestions from our AI to help you focus on what matters most.",
        targetId: 'recommendations-step',
    },
    {
        id: 'finish-step',
        icon: <Check className="h-10 w-10 text-green-500" />,
        title: "You're All Set!",
        description: "You're ready to start your personalized learning journey. Good luck!",
    },
];

type HighlightStyle = {
    top?: number;
    left?: number;
    width?: number;
    height?: number;
} | null;

export default function OnboardingTour() {
    const [isClient, setIsClient] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightStyle, setHighlightStyle] = useState<HighlightStyle>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        setIsClient(true);
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        if (!onboardingComplete) {
            setIsOpen(true);
        }
    }, []);

     useEffect(() => {
        if (!isOpen || !isClient) return;

        const step = tourSteps[currentStep];
        const targetId = step.targetId;

        const updateHighlight = () => {
            if (targetId) {
                const element = document.getElementById(targetId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    setHighlightStyle({
                        top: rect.top,
                        left: rect.left,
                        width: rect.width,
                        height: rect.height,
                    });
                     if(!isMobile) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    }
                }
            } else {
                setHighlightStyle(null);
            }
        };

        // Delay to allow for layout shifts and scrolling
        const timeoutId = setTimeout(updateHighlight, 100);

        // Add event listener for resize and scroll
        window.addEventListener('resize', updateHighlight);
        window.addEventListener('scroll', updateHighlight, true);


        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updateHighlight);
            window.removeEventListener('scroll', updateHighlight, true);
        };
        
    }, [currentStep, isOpen, isClient, isMobile]);


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
        setHighlightStyle(null);
    }

    if (!isClient || !isOpen) {
        return null;
    }

    const step = tourSteps[currentStep];

    const getDialogPosition = (): React.CSSProperties => {
        if (!highlightStyle || !dialogRef.current) return {};
        
        if (isMobile) {
            return {
                bottom: '20px',
                left: '20px',
                right: '20px',
                top: 'auto',
                transform: 'none',
            };
        }

        const dialogHeight = dialogRef.current.offsetHeight;
        const dialogWidth = dialogRef.current.offsetWidth;
        const space = 20;

        let top = highlightStyle.top! + highlightStyle.height! / 2 - dialogHeight / 2;
        let left;

        // Prefer placing on the right
        if (highlightStyle.left! + highlightStyle.width! + dialogWidth + space < window.innerWidth) {
            left = highlightStyle.left! + highlightStyle.width! + space;
        } 
        // Place on the left
        else if (highlightStyle.left! - dialogWidth - space > 0) {
            left = highlightStyle.left! - dialogWidth - space;
        }
        // Fallback to above/below
        else {
            top = highlightStyle.top! - dialogHeight - space > 0
                ? highlightStyle.top! - dialogHeight - space
                : highlightStyle.top! + highlightStyle.height! + space;
            left = highlightStyle.left! + highlightStyle.width! / 2 - dialogWidth / 2;
        }

        return { 
            top: `${Math.max(space, Math.min(top, window.innerHeight - dialogHeight - space))}px`, 
            left: `${Math.max(space, Math.min(left, window.innerWidth - dialogWidth - space))}px`,
            transform: 'none'
        };
    };

    return (
        <>
            {/* Full screen overlay */}
            {highlightStyle && <div className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in-0" />}

            {/* Highlight Box */}
            {highlightStyle && (
                <div
                    className="fixed rounded-lg border-2 border-primary shadow-2xl transition-all duration-300 z-[101] pointer-events-none"
                    style={{
                        top: `${highlightStyle.top! - 4}px`,
                        left: `${highlightStyle.left! - 4}px`,
                        width: `${highlightStyle.width! + 8}px`,
                        height: `${highlightStyle.height! + 8}px`,
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                    }}
                />
            )}
            
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) finishTour(); }}>
                <DialogContent
                    ref={dialogRef}
                    className={cn(
                        "sm:max-w-md fixed z-[102] transition-all duration-300",
                        !highlightStyle && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    )}
                    style={highlightStyle ? getDialogPosition() : {}}
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
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
        </>
    );
}
