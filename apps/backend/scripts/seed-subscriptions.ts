import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { seedSubscriptionPlans } from '../prisma/seeds/subscription-plans';

const prisma = new PrismaClient();

async function main() {
  await seedSubscriptionPlans(prisma);
  console.log('[seed-subscriptions] Plans and features seeded');
}

main()
  .catch((error) => {
    console.error('[seed-subscriptions] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
