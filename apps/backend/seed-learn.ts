import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Flashcards and CheatSheets...');

  await prisma.flashcard.deleteMany();
  await prisma.cheatSheet.deleteMany();

  await prisma.flashcard.createMany({
    data: [
      { front: 'What is the capital of India?', back: 'New Delhi' },
      { front: 'Article 14 of the Constitution', back: 'Equality before the law' },
      { front: 'Article 21 of the Constitution', back: 'Protection of life and personal liberty' },
      { front: 'Who is the father of the Indian Constitution?', back: 'Dr. B.R. Ambedkar' },
      { front: 'When did the Indian Constitution come into effect?', back: 'January 26, 1950' },
    ],
  });

  await prisma.cheatSheet.createMany({
    data: [
      {
        type: 'Article',
        title: 'Article 14',
        description: 'Equality before law and equal protection of laws.',
        tags: 'fundamental rights, equality',
      },
      {
        type: 'Article',
        title: 'Article 21',
        description: 'Protection of life and personal liberty.',
        tags: 'life, liberty',
      },
      {
        type: 'Amendment',
        title: '42nd Amendment (1976)',
        description: 'Known as the "Mini-Constitution". Added Socialist, Secular, and Integrity to the Preamble.',
        tags: 'mini constitution, preamble',
      },
      {
        type: 'Judgment',
        title: 'Kesavananda Bharati Case (1973)',
        description: 'Established the Basic Structure Doctrine.',
        tags: 'basic structure, amendment power',
      },
      {
        type: 'Timeline',
        title: 'Indian National Congress',
        description: 'Founded in 1885 by A.O. Hume.',
        tags: 'history, freedom struggle',
      },
    ],
  });

  console.log('Done seeding.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
