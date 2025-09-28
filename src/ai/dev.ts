import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-test.ts';
import '@/ai/flows/dynamically-score-questions.ts';
import '@/ai/flows/refine-test-difficulty.ts';
import '@/ai/flows/generate-learning-recommendation.ts';
import '@/ai/flows/generate-questions-from-topic-data.ts';
import '@/ai/flows/explain-answer.ts';
