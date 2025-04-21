import {NextResponse} from 'next/server';
import {GoogleGenerativeAI} from '@google/generative-ai';

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables.');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

const promptTemplate = (userText: string) => `
You're a deception analysis AI.

A user will paste a personal message, email, or chat log. Your task is to:

1. Detect signs of dishonesty, manipulation, evasion, or gaslighting.
2. Highlight suspicious phrases.
3. Provide short reasoning for each flag.
4. Give a final verdict:
   - "🟥 Likely Dishonest"
   - "🟨 Unclear / Mixed"
   - "🟩 Likely Honest"

Avoid being overly dramatic. Keep it short, Gen Z-friendly, and a little sarcastic if the tone fits. Format your response like this:

🧠 Analysis:
- "I was busy" → 🚩 Might be an excuse, vague wording.
- "You always overthink" → 🚩 Could be manipulative gaslighting.

📊 Verdict: 🟥 Likely Dishonest

Now analyze this message:
${userText}
`;

export async function POST(req: Request) {
  try {
    const {text} = await req.json();

    if (!text) {
      return NextResponse.json(
        {error: 'No text provided'},
        {
          status: 400,
        }
      );
    }

    const model = genAI.getGenerativeModel({model: 'gemini-pro'});
    const result = await model.generateContent(promptTemplate(text));
    const response = result.response.text();

    return NextResponse.json({analysis: response});
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      {error: 'AI analysis failed'},
      {
        status: 500,
      }
    );
  }
}
