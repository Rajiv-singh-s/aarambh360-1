import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const topics = await prisma.topic.findMany({ select: { id: true, name: true, slug: true } });
  console.log(topics);
}

run().finally(() => prisma.$disconnect());
