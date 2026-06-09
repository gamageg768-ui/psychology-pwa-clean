import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const plan = await prisma.safetyPlan.findUnique({ where: { userId: parseInt(userId) } });
  if (!plan) return NextResponse.json(null);
  return NextResponse.json({
    warning_signs: JSON.parse(plan.warningSigns),
    coping_strategies: JSON.parse(plan.copingStrategies),
    support_contacts: JSON.parse(plan.supportContacts),
    professional_contacts: JSON.parse(plan.professionalContacts),
    updated_at: plan.updatedAt,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const { warning_signs, coping_strategies, support_contacts, professional_contacts } = await req.json();
  const uid = parseInt(userId);
  const plan = await prisma.safetyPlan.upsert({
    where: { userId: uid },
    create: {
      userId: uid,
      warningSigns: JSON.stringify(warning_signs || []),
      copingStrategies: JSON.stringify(coping_strategies || []),
      supportContacts: JSON.stringify(support_contacts || []),
      professionalContacts: JSON.stringify(professional_contacts || []),
    },
    update: {
      warningSigns: JSON.stringify(warning_signs || []),
      copingStrategies: JSON.stringify(coping_strategies || []),
      supportContacts: JSON.stringify(support_contacts || []),
      professionalContacts: JSON.stringify(professional_contacts || []),
    },
  });
  return NextResponse.json({ updated_at: plan.updatedAt });
}
