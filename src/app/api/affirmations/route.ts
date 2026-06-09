import { NextRequest, NextResponse } from 'next/server';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { mood_context } = await req.json();
  const prompt = `Generate 5 powerful, personalized daily affirmations for someone feeling: ${mood_context ?? 'stressed'}. Make them specific, believable, and empowering. Number them 1-5.`;
  const affirmations = await ollamaGenerate(prompt);
  return NextResponse.json({ affirmations });
}
