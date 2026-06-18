import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, technique, pressure_before, pressure_after, content } = await req.json();

  const delta = pressure_before - pressure_after;
  const techniqueLabel: Record<string, string> = {
    'tension-dump': 'Tension Dump (expressive writing)',
    'pmr': 'Progressive Muscle Release',
    'power-exhale': 'Power Exhale Series',
    'shake-it-out': 'Shake It Out (somatic discharge)',
    'vent-to-ai': 'Venting session',
  };

  const prompt = `The user just completed a "${techniqueLabel[technique] ?? technique}" pressure release session.
Their pressure level went from ${pressure_before}/10 down to ${pressure_after}/10 — a reduction of ${delta} points.
${content ? `What they expressed: "${content.slice(0, 300)}"` : ''}

Respond with pure empathy and warm validation in 2–3 sentences. Do NOT give advice or suggestions. Do NOT try to fix anything. Just acknowledge what they did, validate their experience, and make them feel genuinely proud and heard. Be human and brief.`;

  const aiResponse = await ollamaGenerate(prompt);

  const log = await prisma.pressureLog.create({
    data: {
      userId: user_id,
      technique,
      pressureBefore: pressure_before,
      pressureAfter: pressure_after,
      content: content ?? '',
      aiResponse,
    },
  });

  return NextResponse.json({ id: log.id, ai_response: aiResponse, delta });
}

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get('user_id'));
  const logs = await prisma.pressureLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json(logs.map(l => ({
    id: l.id,
    technique: l.technique,
    pressure_before: l.pressureBefore,
    pressure_after: l.pressureAfter,
    content: l.content,
    ai_response: l.aiResponse,
    created_at: l.createdAt,
  })));
}
