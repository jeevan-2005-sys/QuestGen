'use server';

/**
 * @fileOverview Generates targeted follow-up questions based on student feedback.
 *
 * - regenerateQuestions - A function that regenerates questions based on student feedback.
 * - RegenerateQuestionsInput - The input type for the regenerateQuestions function.
 * - RegenerateQuestionsOutput - The return type for the regenerateQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic to generate questions for.'),
  weakAreas: z.string().describe('The specific weak areas the student struggled with (e.g., Light Reaction, Calvin Cycle).'),
  numMcq: z.number().describe('The number of multiple-choice questions to generate.'),
  numLaq: z.number().describe('The number of long answer questions to generate.'),
});
export type RegenerateQuestionsInput = z.infer<typeof RegenerateQuestionsInputSchema>;

const RegenerateQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of generated questions.'),
  studySuggestions: z.string().describe('Suggestions for what to study again.'),
});
export type RegenerateQuestionsOutput = z.infer<typeof RegenerateQuestionsOutputSchema>;

export async function regenerateQuestions(input: RegenerateQuestionsInput): Promise<RegenerateQuestionsOutput> {
  return regenerateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateQuestionsPrompt',
  input: {schema: RegenerateQuestionsInputSchema},
  output: {schema: RegenerateQuestionsOutputSchema},
  prompt: `Student struggled with: {{{weakAreas}}}.\n\nGenerate {{{numMcq}}} MCQs and {{{numLaq}}} LAQs to strengthen these areas in the topic {{{topic}}}. Suggest what to study again. Return questions as an array of strings and suggestions in studySuggestions.`,
});

const regenerateQuestionsFlow = ai.defineFlow(
  {
    name: 'regenerateQuestionsFlow',
    inputSchema: RegenerateQuestionsInputSchema,
    outputSchema: RegenerateQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
