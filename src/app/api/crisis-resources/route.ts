import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    resources: [
      { name: 'National Suicide Prevention Lifeline', contact: '988', type: 'phone' },
      { name: 'Crisis Text Line', contact: 'Text HOME to 741741', type: 'text' },
      { name: 'SAMHSA Helpline', contact: '1-800-662-4357', type: 'phone' },
      { name: 'International Association for Suicide Prevention', contact: 'https://www.iasp.info/resources/Crisis_Centres/', type: 'web' },
    ],
  });
}
