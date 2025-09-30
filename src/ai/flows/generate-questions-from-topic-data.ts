
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
import { getTopicData, getUserProfile } from '@/lib/server/firestore';
import type { TopicData, UserProfile } from '@/lib/firestore';

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

const fallbackQuestions: GenerateQuestionsFromTopicDataOutput = {
  questions: [
    {
      questionText: "A shopkeeper gives a 10% discount on an item marked at $200. He then adds a 10% sales tax on the discounted price. What is the final price? This question tests if you read carefully.",
      options: [
        "$200",
        "$198",
        "$180",
        "$220"
      ],
      correctAnswerIndex: 1,
      explanation: "First, calculate the discount: 10% of $200 is $20. The discounted price is $200 - $20 = $180. Next, calculate the sales tax on the discounted price: 10% of $180 is $18. The final price is $180 + $18 = $198.",
      difficulty: 'hard',
      category: 'Listening',
    },
    {
      questionText: "What is the fundamental theorem of calculus?",
      options: [
        "It connects differentiation and integration.",
        "It defines the properties of a triangle.",
        "It is used to calculate the area of a circle.",
        "It describes the behavior of gases."
      ],
      correctAnswerIndex: 0,
      explanation: "The fundamental theorem of calculus is a theorem that links the concept of differentiating a function with the concept of integrating a function.",
      difficulty: 'easy',
      category: 'Grasping',
    },
    {
      questionText: "What is the formula for the area of a trapezoid?",
      options: [
        "A = (1/2) * (base1 + base2) * height",
        "A = base * height",
        "A = pi * r^2",
        "A = length * width"
      ],
      correctAnswerIndex: 0,
      explanation: "The area of a trapezoid is found by multiplying the average of its bases by its height.",
      difficulty: 'medium',
      category: 'Retention',
    },
    {
      questionText: "A rectangular garden is 12 meters long and 5 meters wide. A walkway of uniform width of 1 meter is built around it. What is the area of the walkway?",
      options: [
        "60 sq meters",
        "38 sq meters",
        "40 sq meters",
        "98 sq meters"
      ],
      correctAnswerIndex: 1,
      explanation: "The area of the garden itself is 12m * 5m = 60 sq meters. With the 1m walkway, the new dimensions are (12+1+1)m by (5+1+1)m, which is 14m by 7m. The total area is 14 * 7 = 98 sq meters. The area of the walkway is the total area minus the garden area: 98 - 60 = 38 sq meters.",
      difficulty: 'hard',
      category: 'Application',
    },
  ]
};


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
        topicData: z.custom<TopicData>().optional(),
        userProfile: z.custom<UserProfile>().optional(),
    })},
    output: { schema: GenerateQuestionsFromTopicDataOutputSchema },
    prompt: `You are an expert test generator. Your task is to create a set of questions for the topic '{{{topic}}}' based on the structured data provided (if any) and the user's past performance (RAG). Your goal is to diagnose *why* a student is struggling by assessing four key learning fundamentals.

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

    Use the following structured data if provided. If not, generate questions based on the topic and user profile alone. **IMPORTANT**: Use the user's learning context (education stream, interests) to frame the questions. For example, if the topic is 'Percentages' and the user is interested in biology, frame a question around population growth rates.

    {{#if topicData}}
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
    {{else}}
    No specific data provided for this topic. Generate general questions about '{{{topic}}}'.
    {{/if}}

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

    if (topicData) {
        console.log(`Successfully fetched data for '${input.topic}'. Generating questions using data-driven prompt.`);
    } else {
        console.log(`No topic data found for '${input.topic}'. Generating questions from topic name and user profile.`);
    }

    try {
        const llmResponse = await dataDrivenPrompt({ 
            ...input, 
            topicData: topicData || undefined, 
            userProfile: userProfile || undefined 
        });
        const output = llmResponse.output;

        if (output && output.questions.length > 0) {
            console.log("Successfully generated questions from topic data.");
            return output;
        }

        console.warn("LLM did not produce a structured output. Attempting to parse from text.");
        const text = llmResponse.text;
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);

        if (match && match[1]) {
            try {
            const extractedJson = JSON.parse(match[1]);
            const validation = GenerateQuestionsFromTopicDataOutputSchema.safeParse(extractedJson);
            if (validation.success) {
                console.log("Successfully parsed JSON from text fallback.");
                return validation.data;
            } else {
                console.error("Parsed JSON from text does not match schema:", validation.error);
            }
            } catch (jsonError) {
            console.error("Failed to parse extracted JSON from text:", jsonError);
            }
        }
        
        console.error("Critical: AI failed to generate or format a test correctly. All fallbacks failed. Serving hardcoded questions.");
        return fallbackQuestions;

    } catch (error) {
        console.error("Critical: Error in generateQuestionsFromTopicDataFlow. Serving hardcoded questions.", error);
        return fallbackQuestions;
    }
  }
);
