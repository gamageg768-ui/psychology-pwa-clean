import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, items } = await req.json();
  const itemList = (items as string[]).filter(Boolean).join(', ');
  const prompt = `A person shared these 3 things they're grateful for today: ${itemList}. Write a warm, encouraging 2-sentence reflection (under 60 words) that validates their gratitude and reinforces a positive mindset. Be genuine and specific.`;
  const reflection = await ollamaGenerate(prompt);
  const entry = await prisma.gratitudeEntry.create({
    data: { userId: user_id, items: JSON.stringify(items), reflection },
  });
  return NextResponse.json({ id: entry.id, reflection });
}
