import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const attempts = await prisma.quizAttempt.findMany({
    select: { id: true, status: true, score: true, totalQuestions: true, userId: true }
  });
  console.log(JSON.stringify(attempts, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
