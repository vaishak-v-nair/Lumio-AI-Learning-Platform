'use server';

/**
 * @fileOverview This file contains a Genkit flow that analyzes test results and refines question difficulty based on user success rates.
 *
 * - refineTestDifficulty - A function that refines test difficulty based on test results.
 * - RefineTestDifficultyInput - The input type for the refineTestDifficulty function.
 * - RefineTestDifficultyOutput - The return type for the refineTestDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineTestDifficultyInputSchema = z.object({
  questionId: z.string().describe('The ID of the question to refine.'),
  successRate: z.number().describe('The success rate for the question (0 to 1).'),
  currentDifficulty: z.number().describe('The current difficulty level of the question.'),
});
export type RefineTestDifficultyInput = z.infer<typeof RefineTestDifficultyInputSchema>;

const RefineTestDifficultyOutputSchema = z.object({
  newDifficulty: z.number().describe('The adjusted difficulty level of the question.'),
  reasoning: z.string().describe('The AI reasoning behind the difficulty adjustment.'),
});
export type RefineTestDifficultyOutput = z.infer<typeof RefineTestDifficultyOutputSchema>;

export async function refineTestDifficulty(input: RefineTestDifficultyInput): Promise<RefineTestDifficultyOutput> {
  return refineTestDifficultyFlow(input);
}

const refineTestDifficultyPrompt = ai.definePrompt({
  name: 'refineTestDifficultyPrompt',
  input: {schema: RefineTestDifficultyInputSchema},
  output: {schema: RefineTestDifficultyOutputSchema},
  prompt: `You are an AI assistant that helps refine the difficulty of test questions based on student performance.

  Analyze the provided question performance data and suggest a new difficulty level. Explain your reasoning for the adjustment.

  Question ID: {{{questionId}}}
  Current Success Rate: {{{successRate}}}
  Current Difficulty: {{{currentDifficulty}}}

  Consider these guidelines:
  - If the success rate is very high (e.g., > 0.8), increase the difficulty.
  - If the success rate is very low (e.g., < 0.2), decrease the difficulty.
  - Adjust the difficulty gradually to avoid drastic changes.
  - Explain your reasoning for the adjustment.

  New Difficulty: 
  Reasoning: `,
});

const refineTestDifficultyFlow = ai.defineFlow(
  {
    name: 'refineTestDifficultyFlow',
    inputSchema: RefineTestDifficultyInputSchema,
    outputSchema: RefineTestDifficultyOutputSchema,
  },
  async input => {
    const {output} = await refineTestDifficultyPrompt(input);
    return output!;
  }
);
