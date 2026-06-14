import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { medication_id, date, taken, side_effects, note } = await req.json();
  const existing = await prisma.medicationLog.findFirst({ where: { medicationId: medication_id, date } });
  let log;
  if (existing) {
    log = await prisma.medicationLog.update({
      where: { id: existing.id },
      data: { taken, sideEffects: side_effects ?? '', note: note ?? '' },
    });
  } else {
    log = await prisma.medicationLog.create({
      data: { medicationId: medication_id, date, taken, sideEffects: side_effects ?? '', note: note ?? '' },
    });
  }
  return NextResponse.json({ id: log.id, taken: log.taken });
}
