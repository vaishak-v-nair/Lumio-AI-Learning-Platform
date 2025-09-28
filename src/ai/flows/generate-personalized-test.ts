'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized tests based on a student's weak areas.
 *
 * - generatePersonalizedTest - A function that generates a personalized test.
 * - GeneratePersonalizedTestInput - The input type for the generatePersonalizedTest function.
 * - GeneratePersonalizedTestOutput - The return type for the generatePersonalizedTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedTestInputSchema = z.object({
  weakAreas: z
    .string()
    .describe(
      'A comma-separated list of the student\'s identified weak areas in learning fundamentals.'
    ),
  numberOfQuestions: z
    .number()
    .describe('The number of questions to generate for the test.'),
});
export type GeneratePersonalizedTestInput = z.infer<
  typeof GeneratePersonalizedTestInputSchema
>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  options: z.array(z.string()).describe('The possible answer options.'),
  correctAnswerIndex: z
    .number()
    .describe('The index of the correct answer in the options array.'),
  explanation: z.string().describe('Explanation of the correct answer.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
  category: z.string().describe('The category of the question'),
});

const GeneratePersonalizedTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated test questions.'),
});
export type GeneratePersonalizedTestOutput = z.infer<
  typeof GeneratePersonalizedTestOutputSchema
>;

export async function generatePersonalizedTest(
  input: GeneratePersonalizedTestInput
): Promise<GeneratePersonalizedTestOutput> {
  return generatePersonalizedTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTestPrompt',
  input: {schema: GeneratePersonalizedTestInputSchema},
  output: {schema: GeneratePersonalizedTestOutputSchema},
  prompt: `You are an expert test generator. You will generate a test for a student based on their weak areas.

  Weak Areas: {{{weakAreas}}}
  Number of Questions: {{{numberOfQuestions}}}

  Each question should have 4 options. One and only one should be correct.
  Include an explanation of the correct answer.
  Dynamically configure the scoring logic for each generated question.
  The difficulty level should be adjusted according to the weak area, such as "easy", "medium", or "hard".
  The category should match the weak area.
  Output ONLY valid JSON. DO NOT include any other text.`,
});

const generatePersonalizedTestFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedTestFlow',
    inputSchema: GeneratePersonalizedTestInputSchema,
    outputSchema: GeneratePersonalizedTestOutputSchema,
  },
  async input => {
    try {
      const llmResponse = await prompt(input);
      const output = llmResponse.output;

      if (!output) {
        console.error("LLM failed to produce a valid output.", llmResponse);
        const text = llmResponse.text;
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);
        if (match && match[1]) {
          try {
            const extractedJson = JSON.parse(match[1]);
            const validation = GeneratePersonalizedTestOutputSchema.safeParse(extractedJson);
            if (validation.success) {
              return validation.data;
            }
          } catch (jsonError) {
            console.error("Failed to parse extracted JSON:", jsonError);
          }
        }
        throw new Error("Failed to get a valid response from the model. Please try again later.");
      }
      
      return output;
    } catch (error) {
      console.error("Error in generatePersonalizedTestFlow:", error);
      throw new Error("Failed to generate a personalized test due to a service error. Please try again later.");
    }
  }
);
