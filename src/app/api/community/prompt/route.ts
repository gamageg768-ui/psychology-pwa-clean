import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateAnonName } from '@/lib/anonName';

const PROMPTS = [
  "What's one small thing that brought you comfort today?",
  "What's something you're letting go of this week?",
  "What would you tell your past self from one year ago?",
  "What does rest look like for you right now?",
  "What's one boundary you're proud of setting?",
  "What emotion have you been carrying quietly?",
  "What's something you've been too hard on yourself about?",
  "What's a small win you haven't celebrated yet?",
  "What does 'healing' mean to you today?",
  "What's one thing you need more of in your life?",
  "What's a feeling you've been avoiding?",
  "What would make today a little gentler?",
  "What's one kind thing you did for yourself recently?",
  "What's weighing on your heart today?",
  "What are you learning about yourself right now?",
  "What does your inner critic say, and what would you say back?",
  "What's a fear you're slowly making peace with?",
  "What do you wish people understood about you?",
  "What's one habit you're trying to build (or break)?",
  "What's something you're grateful for that's easy to overlook?",
  "What does a perfect moment of peace look like for you?",
  "What's the most important relationship you're nurturing?",
  "What's something you've forgiven yourself for lately?",
  "What would a compassionate friend say to you right now?",
  "What's one thing that's been draining your energy?",
  "What's a small change that's made a big difference for you?",
  "What does your body need today?",
  "What's one thing you're looking forward to?",
  "What's a belief you've recently challenged?",
  "What's the most courageous thing you've done lately?",
];

export async function GET(req: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const userId = parseInt(req.nextUrl.searchParams.get('user_id') || '0');

    let prompt = await prisma.dailyPrompt.findFirst({ where: { date: today } });
    if (!prompt) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const question = PROMPTS[dayOfYear % PROMPTS.length];
      prompt = await prisma.dailyPrompt.create({ data: { date: today, question } });
    }

    const responses = await prisma.promptResponse.findMany({
      where: { promptId: prompt.id, isMuted: false },
      orderBy: { createdAt: 'desc' },
    });

    const withNames = await Promise.all(responses.map(async r => ({
      ...r,
      anonName: await getOrCreateAnonName(r.userId),
      reactions: JSON.parse(r.reactions),
    })));

    const userResponse = userId ? responses.find(r => r.userId === userId) : null;

    return NextResponse.json({ prompt, responses: withNames, hasAnswered: !!userResponse });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
