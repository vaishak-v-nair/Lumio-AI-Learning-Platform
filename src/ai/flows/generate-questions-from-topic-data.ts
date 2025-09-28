'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating test questions based on structured data for a specific topic.
 *
 * - generateQuestionsFromTopicData - A function that generates a test from topic data.
 * - GenerateQuestionsFromTopicDataInput - The input type for the function.
 * - GenerateQuestionsFromTopicDataOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getTopicData } from '@/lib/firestore';
import type { TopicData } from '@/lib/firestore';
import { generatePersonalizedTest } from './generate-personalized-test';


const GenerateQuestionsFromTopicDataInputSchema = z.object({
  topic: z.string().describe('The topic to generate questions for.'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateQuestionsFromTopicDataInput = z.infer<typeof GenerateQuestionsFromTopicDataInputSchema>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  options: z.array(z.string()).describe('The possible answer options.'),
  correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
  explanation: z.string().describe('Explanation of the correct answer.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
  category: z.string().describe('The category of the question, should be one of "Listening", "Grasping", "Retention", or "Application"'),
});

const GenerateQuestionsFromTopicDataOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated test questions.'),
});
export type GenerateQuestionsFromTopicDataOutput = z.infer<typeof GenerateQuestionsFromTopicDataOutputSchema>;


export async function generateQuestionsFromTopicData(
  input: GenerateQuestionsFromTopicDataInput
): Promise<GenerateQuestionsFromTopicDataOutput> {
  return generateQuestionsFromTopicDataFlow(input);
}

const dataDrivenPrompt = ai.definePrompt({
    name: 'dataDrivenQuestionPrompt',
    input: { schema: z.object({
        topic: z.string(),
        numberOfQuestions: z.number(),
        topicData: z.custom<TopicData>()
    })},
    output: { schema: GenerateQuestionsFromTopicDataOutputSchema },
    prompt: `You are an expert test generator. Your task is to create a set of questions for the topic '{{{topic}}}' based on the structured data provided.

    You must generate {{{numberOfQuestions}}} questions.

    Use the following concepts and examples to create questions that test a student's understanding in the categories of "Grasping", "Retention", and "Application".

    Concepts:
    {{#each topicData.concepts}}
    - {{name}}: {{explanation}}
    {{/each}}

    Examples:
    {{#each topicData.examples}}
    - Problem: {{problem}}
      Solution: {{solution}}
    {{/each}}

    For each question, provide:
    - 4 multiple-choice options, with only one correct answer.
    - An explanation for the correct answer.
    - A difficulty rating ('easy', 'medium', 'hard').
    - A category ('Grasping', 'Retention', 'Application').

    Output ONLY valid JSON. DO NOT include any other text.
    `,
});

const generateQuestionsFromTopicDataFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFromTopicDataFlow',
    inputSchema: GenerateQuestionsFromTopicDataInputSchema,
    outputSchema: GenerateQuestionsFromTopicDataOutputSchema,
  },
  async (input) => {
    const topicData = await getTopicData(input.topic);

    if (!topicData) {
        // Fallback to the generic generator if no specific data is found for the topic
        console.log(`No topic data found for '${input.topic}'. Falling back to generic test generation.`);
        return generatePersonalizedTest({
            weakAreas: 'Grasping, Retention, Application',
            numberOfQuestions: input.numberOfQuestions,
        });
    }

    try {
        const llmResponse = await dataDrivenPrompt({ ...input, topicData });
        const output = llmResponse.output;

        if (!output) {
          console.error("LLM failed to produce a valid output from topic data.", llmResponse);
          throw new Error("Failed to get a valid response from the model for data-driven questions.");
        }
        
        return output;
    } catch (error) {
        console.error(`Error in generateQuestionsFromTopicDataFlow for topic '${input.topic}':`, error);
        // If the data-driven flow fails, fallback to the original personalized test generator
        return generatePersonalizedTest({
            weakAreas: 'Grasping, Retention, Application',
            numberOfQuestions: input.numberOfQuestions,
        });
    }
  }
);
