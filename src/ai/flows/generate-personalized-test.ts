
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
  category: z.enum(['Listening', 'Grasping', 'Retention', 'Application']).describe('The category of the question, which must be one of "Listening", "Grasping", "Retention", or "Application".'),
});

const GeneratePersonalizedTestOutputSchema = z.object({
  questions: z.array(QuestionSchema).describe('The generated test questions.'),
});
export type GeneratePersonalizedTestOutput = z.infer<
  typeof GeneratePersonalizedTestOutputSchema
>;
export type Question = z.infer<typeof QuestionSchema>;

const fallbackQuestions: GeneratePersonalizedTestOutput = {
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

export async function generatePersonalizedTest(
  input: GeneratePersonalizedTestInput
): Promise<GeneratePersonalizedTestOutput> {
  return generatePersonalizedTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedTestPrompt',
  input: {schema: GeneratePersonalizedTestInputSchema},
  output: {schema: GeneratePersonalizedTestOutputSchema},
  prompt: `You are an expert test generator. Your goal is to create a diagnostic test to understand *why* a student is struggling. You will generate questions that assess four key learning fundamentals: "Listening", "Grasping", "Retention", and "Application".

  - "Listening": Can the student accurately comprehend the details and constraints of a question? (e.g., questions with specific conditions, units, or negative phrasing).
  - "Grasping": Does the student understand the core definition or concept? (e.g., direct "What is X?" questions).
  - "Retention": Can the student recall facts or formulas? (e.g., questions asking to identify a specific formula or historical date).
  - "Application": Can the student apply a concept to solve a problem? (e.g., word problems, multi-step calculations).
  
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
  1.  Analyze the student's profile and historical performance to identify the biggest areas for improvement among the four fundamentals.
  2.  **IMPORTANT**: Use the student's learning context (education stream, interests) to frame the questions. For example, if the student is interested in space, a math problem could be about calculating orbital speeds.
  3.  Generate questions that specifically target these weak areas. For example, if a student has a low average score in "Application", create more application-based problems.
  4.  The difficulty level should be adaptive. If a student is struggling in a category, generate more 'easy' or 'medium' questions for it. If they are excelling, introduce 'hard' questions.
  5.  The category for each question MUST be one of "Listening", "Grasping", "Retention", or "Application".
  6.  Each question must have 4 multiple-choice options, with only one correct answer.
  7.  Provide a clear explanation for the correct answer.
  
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

      if (output && output.questions.length > 0) {
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
            console.error("Parsed JSON from text does not match schema:", validation.error);
          }
        } catch (jsonError) {
          console.error("Failed to parse extracted JSON from text:", jsonError);
        }
      }
      
      console.error("Critical: AI failed to generate or format a test correctly. All fallbacks failed. Serving hardcoded questions.");
      return fallbackQuestions;

    } catch (error) {
      console.error("Critical: Error in generatePersonalizedTestFlow. Serving hardcoded questions.", error);
      return fallbackQuestions;
    }
  }
);
