import { prisma } from './db';

const ADJECTIVES = [
  'Calm', 'Gentle', 'Quiet', 'Serene', 'Bright', 'Soft', 'Kind', 'Warm',
  'Clear', 'Still', 'Bold', 'Swift', 'Deep', 'Free', 'Pure', 'Wise',
  'Brave', 'Hopeful', 'Tender', 'Steady', 'Radiant', 'Golden', 'Silver', 'Azure',
];

const NOUNS = [
  'River', 'Mountain', 'Oak', 'Meadow', 'Forest', 'Sky', 'Stone', 'Wind',
  'Wave', 'Star', 'Moon', 'Dawn', 'Leaf', 'Cloud', 'Brook', 'Fern',
  'Moss', 'Cedar', 'Birch', 'Sage', 'Ember', 'Tide', 'Vale', 'Crest',
];

function generate(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}

export async function getOrCreateAnonName(userId: number): Promise<string> {
  const existing = await prisma.anonName.findUnique({ where: { userId } });
  if (existing) return existing.name;

  let name = generate();
  let attempts = 0;
  while (attempts < 10) {
    const conflict = await prisma.anonName.findFirst({ where: { name } });
    if (!conflict) break;
    name = generate();
    attempts++;
  }

  const created = await prisma.anonName.create({ data: { userId, name } });
  return created.name;
}
