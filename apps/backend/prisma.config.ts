import { defineConfig } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  migrate: {
    url: process.env.DATABASE_URL,
  },
  seed: {
    command: 'ts-node --transpile-only prisma/seed.ts',
  },
});
