import { NextResponse } from 'next/server';
import { ollamaHealthy } from '@/lib/ollama';

export async function GET() {
  const ollama = await ollamaHealthy();
  return NextResponse.json({ status: 'ok', ollama });
}
