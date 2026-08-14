import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const count = await prisma.quizAttempt.count({
    where: { userId: '5553cb4f-1a59-48fd-bfd4-28267bead4a3', status: 'COMPLETED' }
  });
  console.log('COMPLETED QUIZZES FOR USER:', count);
}

run().catch(console.error).finally(() => prisma.$disconnect());
