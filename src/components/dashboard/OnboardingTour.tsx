
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const tourSteps = [
    {
        elementId: 'tour-step-1',
        title: 'Start Your Learning Journey',
        description: "This is where you'll begin. Take personalized tests or choose a specific topic to work on.",
        side: 'bottom',
        align: 'start',
    },
    {
        elementId: 'tour-step-2',
        title: 'Track Your Progress',
        description: "Keep an eye on your core skills here. Our AI tracks your performance to identify areas for improvement.",
        side: 'left',
        align: 'center',
    },
    {
        elementId: 'tour-step-3',
        title: 'Get Personalized Recommendations',
        description: "After each test, our AI will provide a personalized plan with actionable tips to help you grow.",
        side: 'top',
        align: 'start',
    }
];

export default function OnboardingTour({ onFinish }: { onFinish: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
    const [isOpen, setIsOpen] = useState(true);

    const updatePosition = useCallback(() => {
        if (currentStep >= tourSteps.length) return;

        const step = tourSteps[currentStep];
        const element = document.getElementById(step.elementId);

        if (element) {
            const rect = element.getBoundingClientRect();
            const dialogWidth = 350; // approx width of the dialog

            let top = 0, left = 0;

            switch (step.side) {
                case 'bottom':
                    top = rect.bottom + 10;
                    left = (step.align === 'start') ? rect.left : rect.left + (rect.width / 2) - (dialogWidth / 2);
                    break;
                case 'top':
                    top = rect.top - 10;
                    left = (step.align === 'start') ? rect.left : rect.left + (rect.width / 2) - (dialogWidth / 2);
                    break;
                case 'left':
                    top = rect.top + (rect.height / 2);
                    left = rect.left - dialogWidth - 10;
                    break;
                default: // right
                    top = rect.top + (rect.height / 2);
                    left = rect.right + 10;
            }
             setPosition({
                top: `${top}px`,
                left: `${left}px`,
                transform: step.side === 'left' || step.side === 'right' ? 'translateY(-50%)' : 'none',
            });
        }
    }, [currentStep]);
    
    useEffect(() => {
        if (currentStep >= tourSteps.length) {
            setIsOpen(false);
            onFinish();
            return;
        }

        const step = tourSteps[currentStep];
        const element = document.getElementById(step.elementId);
        
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            element.style.setProperty('z-index', '101'); // Ensure highlighted element is above the overlay
            element.style.setProperty('position', 'relative');
            
            // Give a moment for scroll to complete before highlighting
            const timeoutId = setTimeout(() => {
                element.classList.add('tour-highlight');
                updatePosition();
            }, 300);

            return () => {
                clearTimeout(timeoutId);
                element.classList.remove('tour-highlight');
                element.style.removeProperty('z-index');
                element.style.removeProperty('position');
            }
        }

    }, [currentStep, onFinish, updatePosition]);

    useEffect(() => {
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
        }
    }, [updatePosition]);

    const handleNext = () => {
        const currentElement = document.getElementById(tourSteps[currentStep].elementId);
        if (currentElement) {
            currentElement.classList.remove('tour-highlight');
            currentElement.style.removeProperty('z-index');
            currentElement.style.removeProperty('position');
        }
        setCurrentStep(prev => prev + 1);
    };

    if (currentStep >= tourSteps.length) return null;

    const step = tourSteps[currentStep];
    const isLastStep = currentStep === tourSteps.length - 1;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onFinish() }}>
             <style jsx global>{`
                .tour-highlight {
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.5);
                    border-radius: var(--radius);
                    transition: box-shadow 0.3s ease-in-out;
                }
                .tour-dialog-content {
                    z-index: 102 !important; /* Ensure dialog is above the highlight shadow */
                }
            `}</style>
            <DialogContent
                hideCloseButton
                className="fixed w-[350px] transition-all duration-300 ease-in-out tour-dialog-content animate-in fade-in"
                style={position}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>{step.title}</DialogTitle>
                    <DialogDescription>
                        {step.description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-between items-center w-full">
                    <span className="text-sm text-muted-foreground">
                        {currentStep + 1} / {tourSteps.length}
                    </span>
                    <Button onClick={handleNext}>
                        {isLastStep ? 'Start First Test' : 'Next'}
                        {isLastStep ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
