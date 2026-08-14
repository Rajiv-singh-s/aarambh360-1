import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const qs = await prisma.question.findMany({ include: { options: { orderBy: { sortOrder: 'asc' } } } });
  let countA = 0, countB = 0, countC = 0, countD = 0;
  for (const q of qs) {
    const correctIdx = q.options.findIndex(o => o.isCorrect);
    if (correctIdx === 0) countA++;
    if (correctIdx === 1) countB++;
    if (correctIdx === 2) countC++;
    if (correctIdx === 3) countD++;
  }
  console.log(`Total questions: ${qs.length}`);
  console.log(`A: ${countA}, B: ${countB}, C: ${countC}, D: ${countD}`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
