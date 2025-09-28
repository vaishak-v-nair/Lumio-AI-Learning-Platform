'use server';

/**
 * @fileOverview Dynamically configures scoring logic for generated questions with AI assistance.
 *
 * - dynamicallyScoreQuestion - A function that handles the dynamic scoring of a question.
 * - DynamicallyScoreQuestionInput - The input type for the dynamicallyScoreQuestion function.
 * - DynamicallyScoreQuestionOutput - The return type for the dynamicallyScoreQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicallyScoreQuestionInputSchema = z.object({
  question: z.string().describe('The question to be scored.'),
  expectedAnswer: z.string().describe('The expected answer to the question.'),
  userAnswer: z.string().describe('The user provided answer to the question.'),
  topic: z.string().describe('The topic of the question'),
  difficulty: z.string().describe('The difficulty of the question'),
});
export type DynamicallyScoreQuestionInput = z.infer<typeof DynamicallyScoreQuestionInputSchema>;

const DynamicallyScoreQuestionOutputSchema = z.object({
  score: z.number().describe('The score assigned to the user answer.'),
  feedback: z.string().describe('Feedback for the user on their answer.'),
});
export type DynamicallyScoreQuestionOutput = z.infer<typeof DynamicallyScoreQuestionOutputSchema>;

export async function dynamicallyScoreQuestion(input: DynamicallyScoreQuestionInput): Promise<DynamicallyScoreQuestionOutput> {
  return dynamicallyScoreQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicallyScoreQuestionPrompt',
  input: {schema: DynamicallyScoreQuestionInputSchema},
  output: {schema: DynamicallyScoreQuestionOutputSchema},
  prompt: `You are an AI assistant that dynamically scores user answers to questions based on several parameters.

You will receive the question, the expected answer, the user's answer, the topic of the question, and the difficulty.

Based on these parameters, you will score the user's answer and provide feedback.

Question: {{{question}}}
Expected Answer: {{{expectedAnswer}}}
User Answer: {{{userAnswer}}}
Topic: {{{topic}}}
Difficulty: {{{difficulty}}}

Consider the correctness, relevance, and insightfulness of the user's answer when determining the score.

Output the score as a number between 0 and 100.

Output feedback that is helpful and explains the scoring.
`,
});

const dynamicallyScoreQuestionFlow = ai.defineFlow(
  {
    name: 'dynamicallyScoreQuestionFlow',
    inputSchema: DynamicallyScoreQuestionInputSchema,
    outputSchema: DynamicallyScoreQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
