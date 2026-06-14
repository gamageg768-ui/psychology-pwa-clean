import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const meds = await prisma.medication.findMany({
    where: { userId: Number(userId), isActive: true },
    include: {
      logs: { orderBy: { createdAt: 'desc' }, take: 14 },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(meds.map(m => ({
    id: m.id, name: m.name, dosage: m.dosage, frequency: m.frequency,
    time_of_day: m.timeOfDay, notes: m.notes, is_active: m.isActive, created_at: m.createdAt,
    logs: m.logs.map(l => ({
      id: l.id, date: l.date, taken: l.taken, side_effects: l.sideEffects, note: l.note,
    })),
  })));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { medication_id } = await req.json();
  await prisma.medication.updateMany({
    where: { id: medication_id, userId: Number(userId) },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
