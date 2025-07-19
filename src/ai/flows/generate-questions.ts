'use server';
/**
 * @fileOverview Generates questions from a syllabus or text content.
 *
 * - generateQuestions - A function that generates questions from a syllabus.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionsInputSchema = z.object({
  syllabus: z.string().describe('The syllabus content as a string.'),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const QuestionSchema = z.object({
  questionText: z.string().describe('The text of the practice question.'),
  questionType: z
    .enum(['Multiple-Choice', 'Short Answer', 'Long Answer'])
    .describe('The type of question.'),
});

const GenerateQuestionsOutputSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .describe('An array of generated practice questions.'),
});
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: {schema: GenerateQuestionsInputSchema},
  output: {schema: GenerateQuestionsOutputSchema},
  prompt: `Given the following syllabus content, generate a set of practice questions covering the key topics. Include a mix of multiple-choice, short answer, and long answer questions.

Syllabus Content:
{{{syllabus}}}

Return the questions in the specified JSON format.`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
