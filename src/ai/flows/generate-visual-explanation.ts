'use server';
/**
 * @fileOverview Generates a visual explanation for a given question and answer.
 *
 * - generateVisualExplanation - A function that creates a diagram or illustration.
 * - GenerateVisualExplanationInput - The input type for the function.
 * - GenerateVisualExplanationOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualExplanationInputSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  answer: z.string().describe('The correct answer to the question.'),
});
export type GenerateVisualExplanationInput = z.infer<
  typeof GenerateVisualExplanationInputSchema
>;

const GenerateVisualExplanationOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type GenerateVisualExplanationOutput = z.infer<
  typeof GenerateVisualExplanationOutputSchema
>;

export async function generateVisualExplanation(
  input: GenerateVisualExplanationInput
): Promise<GenerateVisualExplanationOutput> {
  const {media} = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: `Generate a clear, simple, and scientifically accurate diagram, illustration, or chart to visually explain the answer for the given question. The image should be easy to understand and directly related to the provided context.

    Question: "${input.question}"
    Answer: "${input.answer}"

    Focus on creating a high-quality educational visual. Avoid adding any text directly into the image itself, unless it's for labeling parts of a diagram.
    `,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const imageDataUri = media.url;
  if (!imageDataUri) {
    throw new Error('Image generation failed to produce an output.');
  }

  return {imageDataUri};
}
