import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const qs = await prisma.question.findMany({ include: { options: true }, take: 10 });
  qs.forEach(q => {
    const correctOpt = q.options.find(o => o.isCorrect);
    console.log(`Q: ${q.id} -> correct label: ${correctOpt?.label}`);
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
