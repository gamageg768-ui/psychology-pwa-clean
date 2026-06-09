import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, situation, automatic_thought, emotion, evidence_for, evidence_against, balanced_thought } = await req.json();
  const prompt = `A person completed a CBT thought record:
Situation: ${situation}
Automatic Thought: ${automatic_thought}
Emotion felt: ${emotion}
Evidence supporting the thought: ${evidence_for}
Evidence against the thought: ${evidence_against}
Their balanced thought: ${balanced_thought}

Write a compassionate, 3-sentence CBT-informed reframe (under 80 words) that validates their effort, reinforces the balanced thought, and offers one practical next step.`;
  const aiReframe = await ollamaGenerate(prompt);
  const record = await prisma.thoughtRecord.create({
    data: { userId: user_id, situation, automaticThought: automatic_thought, emotion, evidenceFor: evidence_for, evidenceAgainst: evidence_against, balancedThought: balanced_thought, aiReframe },
  });
  return NextResponse.json({ id: record.id, ai_reframe: aiReframe });
}
