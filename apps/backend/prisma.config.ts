import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: env('DATABASE_URL'),
  },
  seed: {
    command: 'ts-node --transpile-only prisma/seed.ts',
  },
});
