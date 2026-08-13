import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as admin from 'firebase-admin';
import { RTDB_EXPORT_RELATIVE_PATH } from '../prisma/seeds/types';

const DATABASE_URL =
  process.env.FIREBASE_DATABASE_URL ??
  'https://aarambh360-97dfe-default-rtdb.firebaseio.com';

function initializeFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccountJson =
    process.env.FIREBASE_SERVICE_ACCOUNT ??
    (process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8')
      : undefined);
  const projectId = process.env.FIREBASE_PROJECT_ID ?? 'aarambh360-97dfe';

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: DATABASE_URL,
      projectId: serviceAccount.projectId ?? projectId,
    });
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL: DATABASE_URL,
      projectId,
    });
  }

  throw new Error(
    'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT_PATH, or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.',
  );
}

async function main(): Promise<void> {
  const app = initializeFirebaseAdmin();
  const db = admin.database(app);

  console.log(`[extract] Fetching RTDB root from ${DATABASE_URL} …`);
  const snapshot = await db.ref('/').once('value');
  const payload = snapshot.val();

  if (!payload) {
    throw new Error('[extract] RTDB root snapshot is empty');
  }

  const repoRoot = resolve(__dirname, '../../..');
  const outputDir = resolve(repoRoot, 'legacy-data');
  mkdirSync(outputDir, { recursive: true });

  const outputPath =
    process.env.LEGACY_RTD_EXPORT_PATH ?? resolve(repoRoot, RTDB_EXPORT_RELATIVE_PATH);

  writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');

  const topLevelKeys = Object.keys(payload);
  console.log(`[extract] Saved RTDB export to ${outputPath}`);
  console.log(`[extract] Top-level keys (${topLevelKeys.length}): ${topLevelKeys.join(', ')}`);
}

main().catch((error: unknown) => {
  console.error('[extract] Failed:', error);
  process.exit(1);
});
