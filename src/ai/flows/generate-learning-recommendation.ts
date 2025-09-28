'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized learning recommendations.
 *
 * - generateLearningRecommendation - A function that generates a recommendation.
 * - LearningRecommendationInput - The input type for the generateLearningRecommendation function.
 * - LearningRecommendationOutput - The return type for the generateLearningRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningRecommendationInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  weakness: z
    .string()
    .describe(
      'The identified weak area (e.g., Retention, Application, Grasping).'
    ),
  context: z
    .enum(['student', 'teacher', 'parent'])
    .describe('Who the recommendation is for.'),
});
export type LearningRecommendationInput = z.infer<
  typeof LearningRecommendationInputSchema
>;

const LearningRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('The personalized learning recommendation.'),
});
export type LearningRecommendationOutput = z.infer<
  typeof LearningRecommendationOutputSchema
>;

export async function generateLearningRecommendation(
  input: LearningRecommendationInput
): Promise<LearningRecommendationOutput> {
  return generateLearningRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLearningRecommendationPrompt',
  input: {schema: LearningRecommendationInputSchema},
  output: {schema: LearningRecommendationOutputSchema},
  prompt: `You are an expert instructional designer. Generate a concise, actionable, and personalized learning recommendation based on the provided information.

  The recommendation is for a {{{context}}}.
  The student's main weakness is in {{{weakness}}}.

  - If the context is 'student', provide a direct, encouraging suggestion. Example: "Your 'Application' skills are an area for growth. Try tackling more word problems to see concepts in action. You've got this!"
  - If the context is 'teacher', provide a classroom-level suggestion. Example: "About 30% of the class is struggling with 'Retention'. Consider scheduling short, daily review quizzes (spaced repetition) to reinforce key concepts."
  - If the context is 'parent', provide a supportive tip they can use at home. Example: "Your child is doing well in grasping concepts but takes longer on 'Application'. Encourage them with some timed practice problems at home to build speed and confidence."

  Based on the weakness '{{{weakness}}}' and the audience '{{{context}}}', generate a single, compelling recommendation sentence.
`,
});

const generateLearningRecommendationFlow = ai.defineFlow(
  {
    name: 'generateLearningRecommendationFlow',
    inputSchema: LearningRecommendationInputSchema,
    outputSchema: LearningRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
