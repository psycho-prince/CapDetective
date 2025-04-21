'use server';

import {NextResponse} from 'next/server';
import {analyzeText} from '@/ai/flows/analyze-text-flow';

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

    const result = await analyzeText({userText: text});
    return NextResponse.json({analysis: result.analysis, verdict: result.verdict, clarifyingQuestion: result.clarifyingQuestion});
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      {error: 'AI analysis failed: ' + (error as any).message},
      {
        status: 500,
      }
    );
  }
}
