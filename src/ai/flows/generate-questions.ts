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
  options: z.array(z.string()).optional().describe('An array of options for multiple-choice questions.'),
  answer: z.string().describe('The correct answer for the question. For MCQs, it should be one of the options.'),
  marks: z.number().describe('The marks allocated to the question.'),
  bloomsLevel: z
    .enum(['Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'])
    .describe("The question's level in Bloom's Taxonomy."),
  learningOutcome: z.string().describe('The specific learning outcome this question assesses.'),
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
  prompt: `Given the following syllabus content, generate a set of practice questions covering the key topics. 
  
  Generate exactly:
  - 10 Multiple-Choice questions (1 mark each)
  - 5 Short Answer questions (2 marks each)
  - 2 Long Answer questions (5 marks each)

For each Multiple-Choice question, provide 4 options and the correct answer.
For all questions, provide the question text, type, the correct answer, the marks, the Bloom's Taxonomy level it corresponds to (e.g., 'Remembering', 'Understanding', 'Applying', 'Analyzing', 'Evaluating', 'Creating'), and a specific learning outcome it assesses.

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
