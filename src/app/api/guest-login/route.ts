import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

export async function POST() {
  const guestId = randomBytes(4).toString('hex');
  const user = await prisma.user.create({
    data: { name: 'Guest', email: `guest_${guestId}@mindspace.local` },
  });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email, is_guest: true }, { status: 201 });
}
