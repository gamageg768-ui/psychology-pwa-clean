import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, title, description, category, target_date } = await req.json();

  const prompt = `A person set a wellness goal: "${title}". ${description ? `Details: ${description}.` : ''} Category: ${category}. ${target_date ? `Target date: ${target_date}.` : ''}
Create exactly 4 specific, actionable milestones for this goal. Format as JSON array: [{"title":"milestone 1"},{"title":"milestone 2"},{"title":"milestone 3"},{"title":"milestone 4"}]. Return ONLY the JSON array, no other text.`;

  let milestones: { title: string }[] = [];
  try {
    const raw = await ollamaGenerate(prompt);
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) milestones = JSON.parse(match[0]);
  } catch {
    milestones = [
      { title: 'Define your starting point' },
      { title: 'Complete first week consistently' },
      { title: 'Reach the halfway mark' },
      { title: 'Achieve the full goal' },
    ];
  }

  const goal = await prisma.goal.create({
    data: {
      userId: user_id, title, description: description ?? '', category, targetDate: target_date ?? '',
      aiPlan: `Goal: ${title}`,
      milestones: { create: milestones.map(m => ({ title: m.title })) },
    },
    include: { milestones: true },
  });

  return NextResponse.json({
    id: goal.id, title: goal.title, description: goal.description,
    category: goal.category, target_date: goal.targetDate, status: goal.status,
    ai_plan: goal.aiPlan, created_at: goal.createdAt,
    milestones: goal.milestones.map(m => ({ id: m.id, title: m.title, completed: m.completed })),
  });
}
