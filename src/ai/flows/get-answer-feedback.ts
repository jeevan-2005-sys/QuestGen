'use server';

/**
 * @fileOverview Provides AI-driven feedback on a user's answer.
 *
 * - getAnswerFeedback - A function that analyzes a user's answer against the correct one.
 * - GetAnswerFeedbackInput - The input type for the getAnswerFeedback function.
 * - GetAnswerFeedbackOutput - The return type for the getAnswerFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAnswerFeedbackInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  correctAnswer: z.string().describe('The ideal correct answer.'),
  userAnswer: z.string().describe("The user's submitted answer."),
});
export type GetAnswerFeedbackInput = z.infer<typeof GetAnswerFeedbackInputSchema>;

const GetAnswerFeedbackOutputSchema = z.object({
  feedback: z.string().describe("Constructive feedback for the user, explaining what's wrong or missing and how to improve."),
  suggestedAnswer: z.string().describe("A revised version of the user's answer, incorporating the feedback."),
});
export type GetAnswerFeedbackOutput = z.infer<typeof GetAnswerFeedbackOutputSchema>;

export async function getAnswerFeedback(input: GetAnswerFeedbackInput): Promise<GetAnswerFeedbackOutput> {
  return getAnswerFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAnswerFeedbackPrompt',
  input: {schema: GetAnswerFeedbackInputSchema},
  output: {schema: GetAnswerFeedbackOutputSchema},
  prompt: `You are an expert tutor. A student has provided an answer to a question. Your task is to analyze their answer, compare it to the correct answer, and provide constructive feedback.

  1.  **Identify Inaccuracies:** Point out any incorrect information in the user's answer.
  2.  **Identify Omissions:** Note any key information from the correct answer that is missing in the user's answer.
  3.  **Provide Guidance:** Explain clearly why their answer is incorrect or incomplete.
  4.  **Suggest Improvements:** Offer a revised version of their answer that is correct and complete.

  Be encouraging and helpful in your tone.

  **Question:**
  {{{question}}}

  **Correct Answer:**
  {{{correctAnswer}}}

  **User's Answer:**
  {{{userAnswer}}}
  `,
});

const getAnswerFeedbackFlow = ai.defineFlow(
  {
    name: 'getAnswerFeedbackFlow',
    inputSchema: GetAnswerFeedbackInputSchema,
    outputSchema: GetAnswerFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
