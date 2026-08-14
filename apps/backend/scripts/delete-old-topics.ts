import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const slugsToDelete = ['class-0', 'class-1', 'class-2', 'class-3', 'class-4', 'class-5'];
  const res = await prisma.topic.deleteMany({
    where: { slug: { in: slugsToDelete } }
  });
  console.log(`Deleted ${res.count} old topics.`);
}

run().catch(console.error).finally(() => prisma.$disconnect());
