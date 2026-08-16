import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);
      super({ adapter });
    } else {
      super();
    }
  }

  async onModuleInit(): Promise<void> {
    if (process.env.DATABASE_URL) {
      await this.$connect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
