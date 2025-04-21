'use server';

/**
 * @fileOverview A deception analysis AI agent.
 *
 * - analyzeText - A function that handles the text analysis process.
 * - AnalyzeTextInput - The input type for the analyzeText function.
 * - AnalyzeTextOutput - The return type for the analyzeText function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const AnalyzeTextInputSchema = z.object({
  userText: z.string().describe('The text to analyze for deception.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional().describe('The history of the conversation.'),
});
export type AnalyzeTextInput = z.infer<typeof AnalyzeTextInputSchema>;

const AnalyzeTextOutputSchema = z.object({
  analysis: z.string().describe('The AI\'s analysis, highlighting suspicious phrases and reasoning.'),
  verdict: z.string().describe('The final verdict on the likelihood of dishonesty (Likely Dishonest, Unclear/Mixed, Likely Honest).'),
  clarifyingQuestion: z.string().describe('A clarifying question to ask the user to get more information.'),
});
export type AnalyzeTextOutput = z.infer<typeof AnalyzeTextOutputSchema>;

export async function analyzeText(input: AnalyzeTextInput): Promise<AnalyzeTextOutput> {
  return analyzeTextFlow(input);
}

const askClarifyingQuestion = ai.defineTool(
  {
    name: 'askClarifyingQuestion',
    description: 'Asks the user a clarifying question to gather more information about the message.',
    inputSchema: z.object({
      question: z.string().describe('The clarifying question to ask the user.'),
    }),
    outputSchema: z.string().describe('The clarifying question to ask.'),
  },
  async input => {
    return input.question;
  }
);

const prompt = ai.definePrompt({
  name: 'deceptionAnalysisPrompt',
  input: {
    schema: z.object({
      userText: z.string().describe('The text to analyze for deception.'),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string()
      })).optional().describe('The history of the conversation.'),
    }),
  },
  output: {
    schema: z.object({
      analysis: z.string().describe('The AI\'s analysis, highlighting suspicious phrases and reasoning.'),
      verdict: z.string().describe('The final verdict on the likelihood of dishonesty (Likely Dishonest, Unclear/Mixed, Likely Honest).'),
      clarifyingQuestion: z.string().describe('A clarifying question to ask the user to get more information.'),
    }),
  },
  tools: [askClarifyingQuestion],
  prompt: `You are a deception analysis AI, helping couples and lovers settle arguments by identifying potential red flags in messages.

A user will paste a personal message, email, or chat log. Your task is to:

1. Detect signs of dishonesty, manipulation, evasion, or gaslighting.
2. Highlight suspicious phrases.
3. Provide short reasoning for each flag.
4. If the message is unclear or lacks necessary details for a proper analysis, use the askClarifyingQuestion tool to ask a question that would help you perform a better analysis.
5. Give a final verdict:
   - "🟥 Likely Dishonest"
   - "🟨 Unclear / Mixed"
   - "🟩 Likely Honest"

Avoid being overly dramatic. Keep it short and Gen Z-friendly. Format your response like this:

🧠 Analysis:
- "I was busy" → 🚩 Might be an excuse, vague wording.
- "You always overthink" → 🚩 Could be manipulative gaslighting.

📊 Verdict: 🟥 Likely Dishonest

{% if history %}
Conversation History:
{% for message in history %}
{{ message.role }}: {{ message.content }}
{% endfor %}
{% endif %}

Now analyze this message:
{{{userText}}}
`,
});

const analyzeTextFlow = ai.defineFlow<
  typeof AnalyzeTextInputSchema,
  typeof AnalyzeTextOutputSchema
>({
  name: 'deceptionAnalysisFlow',
  inputSchema: AnalyzeTextInputSchema,
  outputSchema: AnalyzeTextOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return {
    analysis: output!.analysis,
    verdict: output!.verdict,
    clarifyingQuestion: output!.clarifyingQuestion,
  };
});
