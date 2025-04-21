'use server';
/**
 * @fileOverview A Genkit flow for improving the prompt template used for deception analysis.
 *
 * - improvePromptTemplate - A function that handles the prompt template improvement process.
 * - ImprovePromptTemplateInput - The input type for the improvePromptTemplate function.
 * - ImprovePromptTemplateOutput - The return type for the improvePromptTemplate function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImprovePromptTemplateInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt template to be improved.'),
  feedback: z.string().describe('User feedback on the performance of the original prompt.'),
});
export type ImprovePromptTemplateInput = z.infer<typeof ImprovePromptTemplateInputSchema>;

const ImprovePromptTemplateOutputSchema = z.object({
  improvedPrompt: z.string().describe('The improved prompt template.'),
  reasoning: z.string().describe('Explanation of the changes made to the prompt.'),
});
export type ImprovePromptTemplateOutput = z.infer<typeof ImprovePromptTemplateOutputSchema>;

export async function improvePromptTemplate(input: ImprovePromptTemplateInput): Promise<ImprovePromptTemplateOutput> {
  return improvePromptTemplateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePromptTemplatePrompt',
  input: {
    schema: z.object({
      originalPrompt: z.string().describe('The original prompt template.'),
      feedback: z.string().describe('User feedback on the performance of the original prompt.'),
    }),
  },
  output: {
    schema: z.object({
      improvedPrompt: z.string().describe('The improved prompt template.'),
      reasoning: z.string().describe('Explanation of the changes made to the prompt.'),
    }),
  },
  prompt: `You are an AI prompt engineer. Your task is to improve a prompt template based on user feedback.

Original Prompt:
{{originalPrompt}}

Feedback:
{{feedback}}

Instructions:
1. Analyze the feedback to identify areas for improvement in the original prompt.
2. Modify the prompt to address the feedback, focusing on clarity, accuracy, and effectiveness.
3. Explain the changes you made and why they will improve the prompt's performance.
4. Return the improved prompt and your reasoning.

Improved Prompt:
`,
});

const improvePromptTemplateFlow = ai.defineFlow<
  typeof ImprovePromptTemplateInputSchema,
  typeof ImprovePromptTemplateOutputSchema
>({
  name: 'improvePromptTemplateFlow',
  inputSchema: ImprovePromptTemplateInputSchema,
  outputSchema: ImprovePromptTemplateOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
