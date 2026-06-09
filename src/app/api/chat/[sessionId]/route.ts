import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaChat } from '@/lib/ollama';

const THERAPY_SYSTEM = `You are Dr. Aria, a compassionate AI psychologist trained in CBT, DBT, and mindfulness-based therapies.
You provide empathetic, evidence-based mental health support. Always:
- Listen actively and validate feelings
- Use therapeutic techniques appropriately
- Encourage professional help for serious concerns
- Never diagnose but offer psychoeducation
- Maintain boundaries while being warm and supportive
- Ask clarifying questions to better understand the user
Respond in a caring, professional manner.`;

export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const { message } = await req.json();

  const session = await prisma.therapySession.findUnique({ where: { id: parseInt(sessionId) } });
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const messages: { role: string; content: string }[] = JSON.parse(session.messages);
  messages.push({ role: 'user', content: message });

  let system = THERAPY_SYSTEM;
  if (session.sessionType === 'cbt') system += '\n\nFocus on Cognitive Behavioral Therapy techniques. Help identify and challenge cognitive distortions.';
  else if (session.sessionType === 'mindfulness') system += '\n\nFocus on mindfulness-based interventions. Guide breathing exercises and present-moment awareness.';
  else if (session.sessionType === 'grief') system += '\n\nFocus on grief counseling. Apply the stages of grief framework with compassion.';
  else if (session.sessionType === 'anxiety') system += '\n\nFocus on anxiety management. Use exposure therapy concepts and relaxation techniques.';

  const aiResponse = await ollamaChat(messages, system);
  messages.push({ role: 'assistant', content: aiResponse });

  const newTitle = messages.length === 2
    ? (message.length > 50 ? message.slice(0, 50) + '...' : message)
    : session.title;

  await prisma.therapySession.update({
    where: { id: session.id },
    data: { messages: JSON.stringify(messages), title: newTitle },
  });

  return NextResponse.json({ response: aiResponse, session_id: session.id });
}
