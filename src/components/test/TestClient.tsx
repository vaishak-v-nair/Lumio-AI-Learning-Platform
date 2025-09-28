
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GeneratePersonalizedTestOutput, Question } from '@/ai/flows/generate-personalized-test';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import TestHint from './TestHint';
import TestFeedback from './TestFeedback';
import { saveTestResult } from '@/lib/firestore';

const FAST_ANSWER_THRESHOLD = 5; // seconds
const SLOW_ANSWER_THRESHOLD = 30; // seconds

export default function TestClient({ testId }: { testId: string }) {
    const [testData, setTestData] = useState<GeneratePersonalizedTestOutput | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [timings, setTimings] = useState<number[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [startTime, setStartTime] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; correct: boolean } | null>(null);
    const [isClient, setIsClient] = useState(false);

    const router = useRouter();
    const { toast } = useToast();
    const successImage = PlaceHolderImages.find(p => p.id === 'test-complete');

    useEffect(() => {
        setIsClient(true);
        const data = sessionStorage.getItem(`test_${testId}`);
        if (data) {
            const parsedData = JSON.parse(data);
            setTestData(parsedData);
            setUserAnswers(new Array(parsedData.questions.length).fill(null));
            setTimings(new Array(parsedData.questions.length).fill(0));
        } else {
            toast({
                variant: 'destructive',
                title: 'Test Not Found',
                description: 'Could not load the test data.',
            });
            router.push('/dashboard');
        }
        setIsLoading(false);
    }, [testId, router, toast]);

    useEffect(() => {
        if (isClient) {
            setStartTime(Date.now());
        }
        setShowHint(false);
        setFeedback(null);
    }, [currentQuestionIndex, isClient]);

    const adjustDifficulty = (question: Question, correct: boolean, timeTaken: number) => {
        let difficulty = question.difficulty;

        if (correct) {
            if (timeTaken < FAST_ANSWER_THRESHOLD) {
                // Correct and fast: significantly increase difficulty
                difficulty = difficulty === 'easy' ? 'medium' : 'hard';
            } else {
                // Correct but slow: slight increase
                difficulty = difficulty === 'hard' ? 'hard' : 'medium';
            }
        } else {
            if (timeTaken < FAST_ANSWER_THRESHOLD) {
                // Wrong and fast (guessing): slight adjustment
                difficulty = difficulty === 'hard' ? 'medium' : 'easy';
            } else {
                // Wrong and slow (conceptual gap): show hint and decrease difficulty
                setShowHint(true);
                difficulty = 'easy';
            }
        }
        console.log(`Time: ${timeTaken.toFixed(1)}s, Correct: ${correct}, Old Difficulty: ${question.difficulty}, New Difficulty: ${difficulty}`);
    };

    const handleAnswerSubmit = () => {
        if (selectedAnswer === null) {
            toast({
                variant: 'destructive',
                title: 'No Answer Selected',
                description: 'Please select an answer before proceeding.',
            });
            return;
        }

        const timeTaken = (Date.now() - startTime) / 1000;
        const currentQuestion = testData!.questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswerIndex;

        adjustDifficulty(currentQuestion, isCorrect, timeTaken);
        
        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = selectedAnswer;
        setUserAnswers(updatedAnswers);

        const updatedTimings = [...timings];
        updatedTimings[currentQuestionIndex] = timeTaken;
        setTimings(updatedTimings);

        let feedbackMessage = '';
        if (isCorrect) {
            if (timeTaken > SLOW_ANSWER_THRESHOLD) {
                feedbackMessage = `Correct! But it took ${Math.round(timeTaken)}s. Try to answer similar problems faster.`;
            } else {
                feedbackMessage = `Correct! You answered in ${Math.round(timeTaken)}s.`;
            }
        } else {
             if (timeTaken > SLOW_ANSWER_THRESHOLD) {
                feedbackMessage = `Incorrect, you spent ${Math.round(timeTaken)}s. You may need to review the concept of ${currentQuestion.category}.`;
            } else {
                feedbackMessage = `Incorrect. You answered in ${Math.round(timeTaken)}s. Let's review the hint.`;
            }
        }
        setFeedback({ message: feedbackMessage, correct: isCorrect });
    };

    const proceedToNextStep = () => {
        if (showHint) {
            setSelectedAnswer(null); // Keep user on the same question to see hint
            setShowHint(true);
            setFeedback(null); // Hide feedback to show hint
        } else {
            goToNextQuestion();
        }
    };
    
    const goToNextQuestion = () => {
        setFeedback(null);
        setSelectedAnswer(null);

        if (currentQuestionIndex < testData!.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishTest(userAnswers, timings);
        }
    };

    const finishTest = (finalAnswers: (number | null)[], finalTimings: number[]) => {
        let correctCount = 0;
        finalAnswers.forEach((answer, index) => {
            if (answer === testData!.questions[index].correctAnswerIndex) {
                correctCount++;
            }
        });
        const finalScore = (correctCount / testData!.questions.length) * 100;
        setScore(finalScore);
        setIsFinished(true);

        const userName = localStorage.getItem('userName') || 'guest';

        const results = {
            userId: userName,
            score: finalScore,
            answers: finalAnswers,
            timings: finalTimings,
            questions: testData!.questions,
            testId,
            date: new Date().toISOString(),
            topic: 'time-and-distance'
        };
        
        // Save to local storage for immediate access by hooks without re-fetching
        localStorage.setItem('lastTestResult', JSON.stringify(results));
        
        // Save to Firestore in the background
        saveTestResult(results).then(docId => {
            if (docId) {
                localStorage.setItem('lastTestResultId', docId);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Save Failed',
                    description: 'Could not save your test results to the database. Your dashboard may not update.',
                });
            }
        });
    };
    
    if (isLoading || !isClient) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
    }

    if (!testData) {
        return <div className="text-center text-destructive">Failed to load test. Please return to the dashboard.</div>;
    }
    
    if (isFinished) {
        return (
            <Card className="w-full max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="text-3xl">Test Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {successImage && <Image src={successImage.imageUrl} alt={successImage.description} data-ai-hint={successImage.imageHint} width={400} height={300} className="mx-auto rounded-lg" />}
                    <p className="text-xl text-muted-foreground">Your Score:</p>
                    <p className={`text-5xl font-bold ${score >= 70 ? 'text-green-500' : 'text-destructive'}`}>{Math.round(score)}%</p>
                    <div className="pt-4 text-left">
                        <h3 className="font-semibold text-lg mb-2">Review Your Answers</h3>
                        {testData.questions.map((q, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border-b">
                                <p className="flex-1 pr-4">{index + 1}. {q.questionText}</p>
                                {userAnswers[index] === q.correctAnswerIndex ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>}
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard')} className="w-full">
                        Back to Dashboard
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const currentQuestion = testData.questions[currentQuestionIndex];
    const progressValue = ((currentQuestionIndex + 1) / testData.questions.length) * 100;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle>Personalized Test</CardTitle>
                    <div className="flex items-center gap-4">
                         <span className="text-xs font-mono px-2 py-1 bg-muted rounded-md capitalize">{currentQuestion.difficulty}</span>
                        <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {testData.questions.length}</p>
                    </div>
                </div>
                <Progress value={progressValue} className="w-full h-2" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <p className="text-lg font-semibold">{currentQuestion.questionText}</p>
                
                {feedback ? (
                    <TestFeedback correct={feedback.correct} message={feedback.message} />
                ) : showHint ? (
                    <TestHint explanation={currentQuestion.explanation} />
                ) : (
                    <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => setSelectedAnswer(parseInt(value))}>
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-accent/20 has-[:checked]:border-accent transition-colors duration-200">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={feedback !== null} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

            </CardContent>
            <CardFooter>
                {feedback || showHint ? (
                    <Button onClick={showHint ? goToNextQuestion : proceedToNextStep} className="ml-auto bg-accent text-accent-foreground hover:bg-accent/90">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleAnswerSubmit} className="ml-auto bg-primary hover:bg-primary/90">
                        Submit Answer
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

    