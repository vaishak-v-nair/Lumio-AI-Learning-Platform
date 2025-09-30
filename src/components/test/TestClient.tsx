
'use client';
import { useEffect, useState } from 'react';
import type { GeneratePersonalizedTestOutput, Question } from '@/ai/flows/generate-personalized-test';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import TestHint from './TestHint';
import TestFeedback from './TestFeedback';
import { saveTestResult } from '@/lib/firestore';
import { dynamicallyScoreQuestion } from '@/ai/flows/dynamically-score-questions';
import { refineTestDifficulty } from '@/ai/flows/refine-test-difficulty';
import { explainAnswer } from '@/ai/flows/explain-answer';
import type { TestResult } from '@/lib/firestore';

const SLOW_ANSWER_THRESHOLD = 30; // seconds

export default function TestClient({ testData, onFinish }: { testData: (GeneratePersonalizedTestOutput & {topic: string, testId: string}), onFinish: (result: TestResult) => void }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [scores, setScores] = useState<number[]>([]);
    const [timings, setTimings] = useState<number[]>([]);
    const [startTime, setStartTime] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; correct: boolean, explanation?: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentQuestions, setCurrentQuestions] = useState<Question[]>(testData.questions);

    const { toast } = useToast();
    const testId = testData.testId;

     useEffect(() => {
        setUserAnswers(new Array(testData.questions.length).fill(null));
        setScores(new Array(testData.questions.length).fill(0));
        setTimings(new Array(testData.questions.length).fill(0));
    }, [testData.questions]);

    useEffect(() => {
        setStartTime(Date.now());
        setShowHint(false);
        setFeedback(null);
    }, [currentQuestionIndex]);

    const handleAnswerSubmit = async () => {
        if (selectedAnswer === null) {
            toast({
                variant: 'destructive',
                title: 'No Answer Selected',
                description: 'Please select an answer before proceeding.',
            });
            return;
        }

        setIsSubmitting(true);
        const timeTaken = (Date.now() - startTime) / 1000;
        const currentQuestion = currentQuestions[currentQuestionIndex];
        const userAnswerText = currentQuestion.options[selectedAnswer];
        const expectedAnswerText = currentQuestion.options[currentQuestion.correctAnswerIndex];
        const isCorrectManual = selectedAnswer === currentQuestion.correctAnswerIndex;

        try {
            const [scoringResult, explanationResult, difficultyResult] = await Promise.all([
                dynamicallyScoreQuestion({
                    question: currentQuestion.questionText,
                    expectedAnswer: expectedAnswerText,
                    userAnswer: userAnswerText,
                    topic: currentQuestion.category,
                    difficulty: currentQuestion.difficulty,
                }),
                explainAnswer({
                    question: currentQuestion.questionText,
                    userAnswer: userAnswerText,
                    correctAnswer: expectedAnswerText,
                    explanation: currentQuestion.explanation,
                }),
                refineTestDifficulty({
                    questionId: `${testId}-${currentQuestionIndex}`,
                    successRate: isCorrectManual ? 1 : 0,
                    currentDifficulty: currentQuestion.difficulty === 'easy' ? 1 : currentQuestion.difficulty === 'medium' ? 2 : 3,
                })
            ]);

            const isCorrect = scoringResult.score > 70;
            
            setFeedback({ 
                message: scoringResult.feedback, 
                correct: isCorrect, 
                explanation: explanationResult.explanation 
            });
            
            const updatedScores = [...scores];
            updatedScores[currentQuestionIndex] = scoringResult.score;
            setScores(updatedScores);

            
            const newDifficultyString: 'easy' | 'medium' | 'hard' = difficultyResult.newDifficulty <= 1 ? 'easy' : difficultyResult.newDifficulty <= 2 ? 'medium' : 'hard';
            const newQuestions = [...currentQuestions];
            newQuestions[currentQuestionIndex].difficulty = newDifficultyString;
            setCurrentQuestions(newQuestions);
            console.log(`Difficulty Adjustment: ${difficultyResult.reasoning}. New level: ${newDifficultyString}`);
            

            if (!isCorrect && timeTaken > SLOW_ANSWER_THRESHOLD) {
                setShowHint(true);
            }

        } catch (error) {
            console.error("Error during answer processing:", error);
            setFeedback({ 
                message: isCorrectManual ? 'Correct!' : `The correct answer was: ${expectedAnswerText}`, 
                correct: isCorrectManual,
                explanation: currentQuestion.explanation
            });
            
            const updatedScores = [...scores];
            updatedScores[currentQuestionIndex] = isCorrectManual ? 100 : 0;
            setScores(updatedScores);

            if (!isCorrectManual && timeTaken > SLOW_ANSWER_THRESHOLD) {
                setShowHint(true);
            }
        }

        const updatedAnswers = [...userAnswers];
        updatedAnswers[currentQuestionIndex] = selectedAnswer;
        setUserAnswers(updatedAnswers);

        const updatedTimings = [...timings];
        updatedTimings[currentQuestionIndex] = timeTaken;
        setTimings(updatedTimings);

        setIsSubmitting(false);
    };
    
    const goToNextQuestion = () => {
        setFeedback(null);
        setSelectedAnswer(null);
        setShowHint(false);

        if (currentQuestionIndex < currentQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            finishTest(userAnswers, timings, scores);
        }
    };

    const finishTest = (finalAnswers: (number | null)[], finalTimings: number[], finalScores: number[]) => {
        const averageScore = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
        const userName = localStorage.getItem('userName') || 'guest';

        const results: TestResult = {
            userId: userName,
            score: averageScore,
            answers: finalAnswers,
            timings: finalTimings,
            questions: currentQuestions,
            testId,
            date: new Date().toISOString(),
            topic: testData.topic,
        };
        
        saveTestResult(results).then(docId => {
            if (docId) {
                localStorage.setItem('lastTestResultId', docId);
                onFinish(results);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Save Failed',
                    description: 'Could not save test results. Your dashboard may not update.',
                });
                onFinish(results); // still show results, even if save failed
            }
        });
    };
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const progressValue = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

    return (
        <Card className="w-full max-w-2xl mx-auto rounded-2xl">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle>Test: {testData.topic}</CardTitle>
                    <div className="flex items-center gap-4">
                         <span className="text-xs font-mono px-2 py-1 bg-muted rounded-md capitalize">{currentQuestion.difficulty}</span>
                        <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {currentQuestions.length}</p>
                    </div>
                </div>
                <Progress value={progressValue} className="w-full h-2" />
            </CardHeader>
            <CardContent className="space-y-6 pt-6 min-h-[250px]">
                <p className="text-lg font-semibold">{currentQuestion.questionText}</p>
                
                {feedback ? (
                    <TestFeedback correct={feedback.correct} message={feedback.message} explanation={feedback.explanation} />
                ) : showHint ? (
                    <TestHint explanation={currentQuestion.explanation} />
                ) : (
                    <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => setSelectedAnswer(parseInt(value))}>
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-md has-[:checked]:bg-accent/20 has-[:checked]:border-accent transition-colors duration-200">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={feedback !== null || isSubmitting} />
                                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">{option}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )}

            </CardContent>
            <CardFooter>
                {feedback || showHint ? (
                    <Button onClick={goToNextQuestion} className="ml-auto">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleAnswerSubmit} disabled={isSubmitting || selectedAnswer === null} className="ml-auto">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Answer
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
