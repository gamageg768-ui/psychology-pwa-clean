import { NextRequest, NextResponse } from 'next/server';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { technique } = await req.json();
  const prompt = `Create a calming, step-by-step ${technique ?? 'box breathing'} script for stress relief. Keep it under 150 words and very soothing.`;
  const guide = await ollamaGenerate(prompt);
  return NextResponse.json({ guide });
}
