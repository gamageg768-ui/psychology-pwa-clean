import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, content } = await req.json();
  const prompt = `Analyze this journal entry therapeutically:
"${content}"
Provide:
1. Key emotional themes (list 3-5 as comma-separated words)
2. A brief therapeutic reflection (2-3 sentences)
Format your response as:
THEMES: [themes here]
REFLECTION: [reflection here]`;

  const analysis = await ollamaGenerate(prompt);
  let themes = '';
  let reflection = analysis;
  if (analysis.includes('THEMES:') && analysis.includes('REFLECTION:')) {
    const parts = analysis.split('REFLECTION:');
    themes = parts[0].replace('THEMES:', '').trim();
    reflection = parts[1].trim();
  }

  const entry = await prisma.journalEntry.create({
    data: { userId: user_id, content, aiAnalysis: reflection, themes },
  });
  return NextResponse.json({ id: entry.id, ai_analysis: reflection, themes });
}
