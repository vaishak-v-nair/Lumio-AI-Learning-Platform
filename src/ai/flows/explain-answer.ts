'use server';

/**
 * @fileOverview Provides a detailed explanation for a given question and answer.
 *
 * - explainAnswer - A function that generates an explanation.
 * - ExplainAnswerInput - The input type for the explainAnswer function.
 * - ExplainAnswerOutput - The return type for the explainAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  userAnswer: z.string().describe('The answer the user provided.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  explanation: z.string().describe('The pre-defined explanation for the correct answer.'),
});
export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('A detailed, step-by-step explanation of the answer.'),
});
export type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;

export async function explainAnswer(input: ExplainAnswerInput): Promise<ExplainAnswerOutput> {
  return explainAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAnswerPrompt',
  input: {schema: ExplainAnswerInputSchema},
  output: {schema: ExplainAnswerOutputSchema},
  prompt: `You are an expert educator. Your goal is to provide a clear, step-by-step explanation for a test question.

  The user has just answered a question. Here is the context:
  - The Question: {{{question}}}
  - The User's Answer: {{{userAnswer}}}
  - The Correct Answer: {{{correctAnswer}}}
  - The Basic Explanation: {{{explanation}}}

  Based on this, generate a comprehensive, easy-to-understand explanation.
  - If the user was correct, confirm why their answer is right and elaborate on the core concept.
  - If the user was incorrect, gently point out the mistake and walk through the steps to get to the correct answer.
  - Break down the logic. Start from the basic concept and build up to the solution.
  - Keep it concise and encouraging.
`,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlow',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async input => {
    try {
      const llmResponse = await prompt(input);
      const output = llmResponse.output;

      if (!output) {
        throw new Error("The AI model failed to produce a valid explanation.");
      }
      return output;
    } catch (error) {
      console.error("Error in explainAnswerFlow:", error);
      // Fallback for when the AI service fails
      return {
        explanation: input.explanation || "Could not generate a detailed explanation at this time.",
      };
    }
  }
);
