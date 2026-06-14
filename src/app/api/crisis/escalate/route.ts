import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, note } = await req.json();
  const event = await prisma.crisisEvent.create({
    data: { userId: user_id, note: note ?? '' },
  });
  const contacts = await prisma.trustedContact.findMany({ where: { userId: user_id } });
  return NextResponse.json({
    id: event.id,
    contacts_notified: contacts.length,
    message: 'Crisis event logged. Contact your trusted contacts or call a crisis line.',
  });
}
