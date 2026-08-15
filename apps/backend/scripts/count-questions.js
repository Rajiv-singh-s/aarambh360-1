const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p1 = await prisma.question.count({ where: { type: 'MCQ_SINGLE', publishStatus: 'PUBLISHED' }});
  const p2 = await prisma.question.count({ where: { type: 'MCQ_MULTI', publishStatus: 'PUBLISHED' }});
  const m = await prisma.mainsQuestion.count({ where: { publishStatus: 'PUBLISHED' }});
  console.log('P1:', p1, 'P2:', p2, 'M:', m);
}
main().catch(console.error).finally(() => prisma.$disconnect());
