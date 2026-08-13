import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { runLegacySeedPipeline } from './seeds/pipeline';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const report = await runLegacySeedPipeline(prisma);

  console.log('\n[seed] Summary');
  console.log(`  exportLoaded: ${report.exportLoaded}`);
  console.log(`  exportPath: ${report.exportPath ?? 'N/A'}`);
  console.log(`  discovered: ${report.totals.discovered}`);
  console.log(`  imported: ${report.totals.imported}`);
  console.log(`  updated: ${report.totals.updated}`);
  console.log(`  skipped: ${report.totals.skipped}`);
  console.log(`  rejected: ${report.totals.rejected}`);
  console.log(`  duplicate: ${report.totals.duplicate}`);

  if (report.totals.warnings.length > 0) {
    console.log('\n[seed] Warnings:');
    report.totals.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  if (report.totals.rejections.length > 0) {
    console.log(`\n[seed] Sample rejections (${Math.min(5, report.totals.rejections.length)} shown):`);
    report.totals.rejections.slice(0, 5).forEach((reason) => console.log(`  - ${reason}`));
  }
}

main()
  .catch((error: unknown) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
