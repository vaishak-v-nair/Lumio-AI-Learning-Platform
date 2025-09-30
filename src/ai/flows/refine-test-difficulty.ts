
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
  successRate: z.number().describe('The success rate for the question (0 for incorrect, 1 for correct).'),
  currentDifficulty: z.number().describe('The current difficulty level of the question (1=easy, 2=medium, 3=hard).'),
});
export type RefineTestDifficultyInput = z.infer<typeof RefineTestDifficultyInputSchema>;

const RefineTestDifficultyOutputSchema = z.object({
  newDifficulty: z.number().describe('The adjusted difficulty level of the question (1-3).'),
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

  Analyze the provided question performance data and suggest a new difficulty level. The difficulty must be an integer: 1 for easy, 2 for medium, or 3 for hard.

  Question ID: {{{questionId}}}
  Success on last attempt: {{{successRate}}} (1 for correct, 0 for incorrect)
  Current Difficulty: {{{currentDifficulty}}} (1=easy, 2=medium, 3=hard)

  Guidelines:
  - If the answer was correct (successRate=1), consider increasing the difficulty. But do not jump from easy (1) to hard (3).
  - If the answer was incorrect (successRate=0), consider decreasing the difficulty.
  - Adjust the difficulty gradually (e.g., from medium (2) to hard (3), or medium (2) to easy (1)).
  - Provide a brief, one-sentence reasoning for the adjustment.
  - The new difficulty MUST be an integer between 1 and 3.

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
    try {
        const llmResponse = await refineTestDifficultyPrompt(input);
        const output = llmResponse.output;

        if (!output) {
          throw new Error("The AI model failed to produce a valid difficulty refinement.");
        }
        // Clamp the difficulty to be within the 1-3 range and ensure it's an integer
        output.newDifficulty = Math.max(1, Math.min(3, Math.round(output.newDifficulty)));
        return output;
    } catch (error) {
        console.error("Error in refineTestDifficultyFlow:", error);
        // Fallback for when the AI service fails
        let fallbackDifficulty = input.currentDifficulty;
        if (input.successRate === 1) {
            fallbackDifficulty = Math.min(3, input.currentDifficulty + 1);
        } else {
            fallbackDifficulty = Math.max(1, input.currentDifficulty - 1);
        }
        return {
            newDifficulty: fallbackDifficulty,
            reasoning: "Could not refine difficulty via AI. Using standard adjustment.",
        };
    }
  }
);
