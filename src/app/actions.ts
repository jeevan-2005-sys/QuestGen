'use server';

import {
  generateQuestions,
  type GenerateQuestionsInput,
  type GenerateQuestionsOutput,
} from '@/ai/flows/generate-questions';
import {
  explainAnswer,
  type ExplainAnswerInput,
  type ExplainAnswerOutput,
} from '@/ai/flows/explain-answer';
import {
  regenerateQuestions,
  type RegenerateQuestionsInput,
  type RegenerateQuestionsOutput,
} from '@/ai/flows/regenerate-questions';
import {
  getAnswerFeedback,
  type GetAnswerFeedbackInput,
  type GetAnswerFeedbackOutput,
} from '@/ai/flows/get-answer-feedback';
import {
  generateVisualExplanation,
  type GenerateVisualExplanationInput,
  type GenerateVisualExplanationOutput,
} from '@/ai/flows/generate-visual-explanation';


export async function handleGenerateQuestions(
  syllabus: string
): Promise<GenerateQuestionsOutput> {
  return await generateQuestions({ syllabus });
}

export async function handleExplainAnswer(
  input: ExplainAnswerInput
): Promise<ExplainAnswerOutput> {
  return await explainAnswer(input);
}

export async function handleRegenerateQuestions(
  input: RegenerateQuestionsInput
): Promise<RegenerateQuestionsOutput> {
  return await regenerateQuestions(input);
}

export async function handleGetAnswerFeedback(
  input: GetAnswerFeedbackInput
): Promise<GetAnswerFeedbackOutput> {
  return await getAnswerFeedback(input);
}

export async function handleGenerateVisualExplanation(
  input: GenerateVisualExplanationInput
): Promise<GenerateVisualExplanationOutput> {
  return await generateVisualExplanation(input);
}
