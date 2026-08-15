const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const q = await prisma.question.findMany({ where: { type: 'MCQ_SINGLE', publishStatus: 'PUBLISHED' }, take: 100 });
  for (const qItem of q) {
    await prisma.question.update({ where: { id: qItem.id }, data: { type: 'MCQ_MULTI' } });
  }
  console.log('Updated 100 questions to MCQ_MULTI');
}
main().catch(console.error).finally(() => prisma.$disconnect());
