const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const dcs = await prisma.dailyChallenge.findMany({
    include: { prelimsQuestions: { include: { question: true } }, mainsQuestion: true }
  });
  console.log(JSON.stringify(dcs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
