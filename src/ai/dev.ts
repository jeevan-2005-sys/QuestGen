import { config } from 'dotenv';
config();

import '@/ai/flows/regenerate-questions.ts';
import '@/ai/flows/explain-answer.ts';
import '@/ai/flows/generate-questions.ts';
import '@/ai/flows/get-answer-feedback.ts';
