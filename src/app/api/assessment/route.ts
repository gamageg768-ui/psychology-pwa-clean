import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ollamaGenerate } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  const { user_id, assessment_type, answers } = await req.json();
  const score = answers.length ? (answers.reduce((s: number, a: number) => s + a, 0) / answers.length) * 10 : 0;

  const prompt = `Psychology assessment results:
Type: ${assessment_type}
Score: ${score.toFixed(1)}/10
Answers: ${answers}
Provide a professional, empathetic interpretation (3-4 sentences) of these results and 2 actionable recommendations.
Do NOT diagnose. Frame as general wellness feedback.`;

  const report = await ollamaGenerate(prompt);
  const interpretation = score < 4 ? 'Low concern' : score < 7 ? 'Moderate concern' : 'High concern - professional support recommended';

  const assessment = await prisma.assessment.create({
    data: {
      userId: user_id, assessmentType: assessment_type,
      answers: JSON.stringify(answers), score, interpretation, aiReport: report,
    },
  });
  return NextResponse.json({ id: assessment.id, score, interpretation, ai_report: report });
}
