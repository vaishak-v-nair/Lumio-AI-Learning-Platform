
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
import type { AggregatedPerformance } from '@/lib/firestore';

const GeneratePersonalizedTestInputSchema = z.object({
  weakAreas: z
    .string()
    .describe(
      'A comma-separated list of the student\'s identified weak areas in learning fundamentals.'
    ),
  numberOfQuestions: z
    .number()
    .describe('The number of questions to generate for the test.'),
  learningContext: z.string().optional().describe('Free-form text describing the user, including their education level, academic stream, interests, and learning style.'),
  aggregatedPerformance: z.custom<AggregatedPerformance>().optional().describe('The student\'s historical performance data.'),
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
  category: z.string().describe('The category of the question, should be one of "Listening", "Grasping", "Retention", or "Application"'),
});

const GeneratePersonalizedTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated test questions.'),
});
export type GeneratePersonalizedTestOutput = z.infer<
  typeof GeneratePersonalizedTestOutputSchema
>;
export type Question = z.infer<typeof QuestionSchema>;

export async function generatePersonalizedTest(
  input: GeneratePersonalizedTestInput
): Promise<GeneratePersonalizedTestOutput> {
  return generatePersonalizedTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTestPrompt',
  input: {schema: GeneratePersonalizedTestInputSchema},
  output: {schema: GeneratePersonalizedTestOutputSchema},
  prompt: `You are an expert test generator. You will generate a test for a student based on their profile, weak areas, and past performance. This is a form of Retrieval-Augmented Generation (RAG).

  Student Profile:
  - Learning Context: {{{learningContext}}}
  - Identified Weak Areas: {{{weakAreas}}}

  Historical Performance (RAG Data):
  {{#if aggregatedPerformance}}
    {{#each aggregatedPerformance}}
    - In '{{@key}}', the student has answered {{correctAnswers}} out of {{totalQuestions}} questions correctly ({{averageScore}}%).
    {{/each}}
  {{else}}
    - No historical performance data available. This is their first test.
  {{/if}}
  
  Number of Questions: {{{numberOfQuestions}}}
  
  Instructions:
  1.  Analyze the student's profile and historical performance to identify the biggest areas for improvement.
  2.  Generate questions that specifically target these weak areas. For example, if a student has a low average score in "Application", create more application-based problems.
  3.  The difficulty level should be adaptive. If a student is struggling in a category, generate more 'easy' or 'medium' questions for it. If they are excelling, introduce 'hard' questions.
  4.  The category for each question must match one of the student's weak areas (e.g., "Grasping", "Retention", "Application").
  5.  Each question must have 4 multiple-choice options, with only one correct answer.
  6.  Provide a clear explanation for the correct answer.
  
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

      if (output) {
        return output;
      }
      
      console.warn("LLM did not produce a structured output. Attempting to parse from text.");
      const text = llmResponse.text;
      const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
      const match = text.match(jsonRegex);

      if (match && match[1]) {
        try {
          const extractedJson = JSON.parse(match[1]);
          const validation = GeneratePersonalizedTestOutputSchema.safeParse(extractedJson);
          if (validation.success) {
            console.log("Successfully parsed JSON from text fallback.");
            return validation.data;
          } else {
            console.error("Parsed JSON does not match schema:", validation.error);
          }
        } catch (jsonError) {
          console.error("Failed to parse extracted JSON from text:", jsonError);
        }
      }
      
      throw new Error("Failed to get a valid response from the model. Please try again later.");

    } catch (error) {
      console.error("Error in generatePersonalizedTestFlow:", error);
      throw new Error("Failed to generate a personalized test due to a service error. Please try again later.");
    }
  }
);
