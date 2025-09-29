
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
import { getTopicData } from '@/lib/server/firestore';
import { getUserProfile, type TopicData, type UserProfile } from '@/lib/firestore';
import { generatePersonalizedTest } from './generate-personalized-test';


const GenerateQuestionsFromTopicDataInputSchema = z.object({
  topic: z.string().describe('The topic to generate questions for.'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
  userId: z.string().describe('The ID of the user taking the test.'),
});
export type GenerateQuestionsFromTopicDataInput = z.infer<typeof GenerateQuestionsFromTopicDataInputSchema>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the question.'),
  options: z.array(z.string()).describe('The possible answer options.'),
  correctAnswerIndex: z.number().describe('The index of the correct answer in the options array.'),
  explanation: z.string().describe('Explanation of the correct answer.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
  category: z.enum(['Listening', 'Grasping', 'Retention', 'Application']).describe('The category of the question, which must be one of "Listening", "Grasping", "Retention", or "Application".'),
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
        topicData: z.custom<TopicData>(),
        userProfile: z.custom<UserProfile>().optional(),
    })},
    output: { schema: GenerateQuestionsFromTopicDataOutputSchema },
    prompt: `You are an expert test generator. Your task is to create a set of questions for the topic '{{{topic}}}' based on the structured data provided and the user's past performance (RAG). Your goal is to diagnose *why* a student is struggling by assessing four key learning fundamentals.

    You must generate {{{numberOfQuestions}}} questions.

    The Four Learning Fundamentals:
    - "Listening": Can the student accurately comprehend the details and constraints of a question? (e.g., questions with specific conditions, units, or negative phrasing).
    - "Grasping": Does the student understand the core definition or concept? (e.g., direct "What is X?" questions).
    - "Retention": Can the student recall facts or formulas? (e.g., questions asking to identify a specific formula or historical date).
    - "Application": Can the student apply a concept to solve a problem? (e.g., word problems, multi-step calculations).

    User Profile & Performance Data (RAG):
    {{#if userProfile.learningContext}}
    - Context: {{{userProfile.learningContext}}}
    {{/if}}
    {{#if userProfile.aggregatedPerformance}}
      {{#each userProfile.aggregatedPerformance}}
      - In '{{@key}}', the student's historical accuracy is {{averageScore}}%.
      {{/each}}
      Focus on generating more questions for categories with lower scores.
    {{else}}
      - No performance history available.
    {{/if}}

    Use the following structured data to create questions. **IMPORTANT**: Use the user's learning context (education stream, interests) to frame the questions. For example, if the topic is 'Percentages' and the user is interested in biology, frame a question around population growth rates.

    Topic Data for '{{{topic}}}':
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
    - An adaptive difficulty rating ('easy', 'medium', 'hard') based on the user's performance.
    - A category from the four fundamentals ('Listening', 'Grasping', 'Retention', 'Application') that targets a weak area if possible.

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
    console.log(`Attempting to fetch data for topic: ${input.topic}`);
    const [topicData, userProfile] = await Promise.all([
        getTopicData(input.topic),
        getUserProfile(input.userId),
    ]);

    if (!topicData) {
        // Fallback to the generic generator if no specific data is found for the topic
        console.log(`No topic data found for '${input.topic}' in Firestore. Falling back to generic test generation.`);
        return generatePersonalizedTest({
            weakAreas: 'Grasping, Retention, Application, Listening',
            numberOfQuestions: input.numberOfQuestions,
            learningContext: userProfile?.learningContext,
            aggregatedPerformance: userProfile?.aggregatedPerformance,
        });
    }

    console.log(`Successfully fetched data for '${input.topic}'. Generating questions using data-driven prompt.`);
    try {
        const llmResponse = await dataDrivenPrompt({ ...input, topicData, userProfile: userProfile || undefined });
        const output = llmResponse.output;

        if (!output) {
          console.error("LLM failed to produce a valid output from topic data.", llmResponse);
          throw new Error("Failed to get a valid response from the model for data-driven questions.");
        }
        
        console.log("Successfully generated questions from topic data.");
        return output;
    } catch (error) {
        console.error(`Error in generateQuestionsFromTopicDataFlow for topic '${input.topic}':`, error);
        // If the data-driven flow fails, fallback to the original personalized test generator
        console.log("Falling back to generic test generation due to an error.");
        return generatePersonalizedTest({
            weakAreas: 'Grasping, Retention, Application, Listening',
            numberOfQuestions: input.numberOfQuestions,
            learningContext: userProfile?.learningContext,
            aggregatedPerformance: userProfile?.aggregatedPerformance,
        });
    }
  }
);
