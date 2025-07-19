'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating visually-based questions (images/data) for subjects like Biology, Math, and Economics.
 *
 * - generateImageQuestions - A function that handles the generation of image-based questions.
 * - GenerateImageQuestionsInput - The input type for the generateImageQuestions function.
 * - GenerateImageQuestionsOutput - The return type for the generateImageQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageQuestionsInputSchema = z.object({
  subject: z.enum(['Biology', 'Math', 'Economics']).describe('The subject for which to generate image-based questions.'),
  topic: z.string().describe('The specific topic within the subject for which to generate questions.'),
  questionCount: z.number().min(1).max(5).describe('The number of questions to generate.'),
});
export type GenerateImageQuestionsInput = z.infer<typeof GenerateImageQuestionsInputSchema>;

const GenerateImageQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The generated question.'),
      imageDataUri: z.string().optional().describe('Data URI of the generated image, if applicable.'),
      explanation: z.string().describe('The AI-generated explanation for the question.'),
    })
  ),
});
export type GenerateImageQuestionsOutput = z.infer<typeof GenerateImageQuestionsOutputSchema>;

export async function generateImageQuestions(input: GenerateImageQuestionsInput): Promise<GenerateImageQuestionsOutput> {
  return generateImageQuestionsFlow(input);
}

const generateImageQuestionPrompt = ai.definePrompt({
  name: 'generateImageQuestionPrompt',
  input: {schema: GenerateImageQuestionsInputSchema},
  output: {schema: GenerateImageQuestionsOutputSchema},
  prompt: `You are an AI assistant designed to generate visually-based questions for students.

  Subject: {{{subject}}}
  Topic: {{{topic}}}

  Generate {{{questionCount}}} questions related to the topic. For each question, if applicable, generate an image that illustrates the concept and provide its data URI. Always generate an explanation for each question.

  Example for Biology:
  Question: "Describe the process illustrated in the following image: {{media url='data:image/png;base64,<base64_encoded_image>'}}"
  Explanation: "The image illustrates the process of photosynthesis..."

  Example for Math:
  Question: "Analyze the data presented in the following graph: {{media url='data:image/png;base64,<base64_encoded_image>'}}"
  Explanation: "The graph shows the relationship between variables x and y..."

  Example for Economics:
  Question: "Interpret the supply and demand curves in the following diagram: {{media url='data:image/png;base64,<base64_encoded_image>'}}"
  Explanation: "The diagram illustrates the principles of supply and demand..."

  Output the questions in JSON format:
  {
    "questions": [
      {
        "question": "...",
        "imageDataUri": "data:image/png;base64,...",
        "explanation": "..."
      }
    ]
  }`,
});

const generateImageQuestionsFlow = ai.defineFlow(
  {
    name: 'generateImageQuestionsFlow',
    inputSchema: GenerateImageQuestionsInputSchema,
    outputSchema: GenerateImageQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateImageQuestionPrompt(input);
    return output!;
  }
);
