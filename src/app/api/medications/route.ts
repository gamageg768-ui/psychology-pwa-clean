import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { user_id, name, dosage, frequency, time_of_day, notes } = await req.json();
  const med = await prisma.medication.create({
    data: { userId: user_id, name, dosage, frequency, timeOfDay: time_of_day, notes: notes ?? '' },
  });
  return NextResponse.json({
    id: med.id, name: med.name, dosage: med.dosage, frequency: med.frequency,
    time_of_day: med.timeOfDay, notes: med.notes, is_active: med.isActive, created_at: med.createdAt,
  });
}
