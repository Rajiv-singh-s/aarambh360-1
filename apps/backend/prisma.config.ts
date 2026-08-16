import { PrismaConfig } from '@prisma/config';

export default {
  earlyAccess: true,
  seed: {
    command: 'ts-node --transpile-only prisma/seed.ts',
  },
} satisfies PrismaConfig;
