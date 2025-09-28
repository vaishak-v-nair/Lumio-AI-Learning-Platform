
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating teacher insights based on class performance.
 *
 * - generateTeacherInsight - A function that generates a classroom-level insight.
 * - TeacherInsightInput - The input type for the function.
 * - TeacherInsightOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategoryPerformanceSchema = z.object({
  category: z.string().describe("The learning fundamental category (e.g., 'Grasping')."),
  averageScore: z.number().describe('The average score for this category across the class.'),
  averageTime: z.number().describe('The average response time in seconds for this category.'),
});

const TeacherInsightInputSchema = z.object({
  classPerformance: z.array(CategoryPerformanceSchema).describe('An array of performance data for each learning category.'),
});
export type TeacherInsightInput = z.infer<typeof TeacherInsightInputSchema>;

const TeacherInsightOutputSchema = z.object({
  insight: z.string().describe('A detailed, actionable insight for the teacher.'),
});
export type TeacherInsightOutput = z.infer<typeof TeacherInsightOutputSchema>;


export async function generateTeacherInsight(input: TeacherInsightInput): Promise<TeacherInsightOutput> {
  return generateTeacherInsightFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateTeacherInsightPrompt',
  input: {schema: TeacherInsightInputSchema},
  output: {schema: TeacherInsightOutputSchema},
  prompt: `You are an expert instructional designer providing data-driven advice to a teacher. Analyze the following class performance data and generate an actionable insight.

  Class Performance Data:
  {{#each classPerformance}}
  - Category: {{{category}}}
    - Average Score: {{{averageScore}}}%
    - Average Time: {{{averageTime}}}s
  {{/each}}

  Based on this data, provide a concise and actionable insight for the teacher. Structure your response in three parts:
  1.  **Observation**: Briefly state the most significant trend from the data (e.g., "The class is struggling with X, as shown by...").
  2.  **Insight**: Explain the likely pedagogical reason for this trend (e.g., "This suggests students may understand the theory but cannot apply it under pressure.").
  3.  **Recommendation**: Provide a concrete, actionable step the teacher can take (e.g., "Consider a 10-minute timed group exercise focused on application-based problems.").
  
  Combine these three parts into a single, coherent paragraph.
`,
});

const generateTeacherInsightFlow = ai.defineFlow(
  {
    name: 'generateTeacherInsightFlow',
    inputSchema: TeacherInsightInputSchema,
    outputSchema: TeacherInsightOutputSchema,
  },
  async input => {
    try {
      const llmResponse = await prompt(input);
      const output = llmResponse.output;

      if (!output) {
        throw new Error("The AI model failed to produce a valid teacher insight.");
      }
      return output;
    } catch (error) {
      console.error("Error in generateTeacherInsightFlow:", error);
      // Fallback for when the AI service fails
      return {
        insight: "Could not generate an AI-powered insight at this time. Review the data to identify areas where students are struggling with low accuracy or high response times.",
      };
    }
  }
);
