# Aarambh360 Implementation Progress Tracker

## Current Phase: Step 20 — 🟡 RELEASE CANDIDATE READY — OWNER QA REQUIRED

**Steps 1–19:** ✅ COMPLETE  
**Step 20:** 🟡 Engineering QA complete — awaiting owner manual QA and approval  
**Store submission:** ❌ NOT performed (by design)

---

## Step 20 Final Verification (2026-08-13)

| Suite | Tests / Checks | Result |
|-------|----------------|--------|
| Backend unit & E2E tests | 99 / 99 | **PASS** |
| Razorpay webhook raw-body fix | Unit + Security E2E | **PASS** |
| TypeScript Compiler | All 4 packages | **PASS** |
| Backend production build | `nest build` | **PASS** |
| Admin production build | `next build` | **PASS** |
| Expo config validation | `npx expo config` | **PASS** |
| Android Metro export | `expo export --platform android` | **PASS** |
| iOS Metro export | `expo export --platform ios` | **PASS** |
| Prisma schema validation | `prisma validate` | **PASS** |
| EAS signed RC builds | Not run | **NOT TESTED** |
| Owner device manual QA | Checklist in STEP-20 report | **PENDING** |

### Step 20 Implementation Details
- **Razorpay webhook blocker resolved:** NestJS `rawBody: true`; dedicated `SubscriptionsWebhookController` verifies HMAC against exact raw bytes; regression tests in `payment.provider.spec.ts` and `security.e2e-spec.ts`.
- **Production env audit:** Updated `apps/backend/.env.example` with development/staging/production sections.
- **Full regression:** 99/99 backend tests; monorepo typecheck; admin + backend production builds; Android/iOS Metro exports.
- **Release candidate documentation:** `docs/STEP-20-FINAL-QA-REPORT.md` with owner manual QA checklist.
- **Hard stop:** No Google Play or App Store submission performed.

---

## Step 19 Final Verification (2026-08-13)

| Suite | Tests / Checks | Result |
|-------|----------------|--------|
| Backend unit & E2E tests | 92 / 92 | **PASS** |
| Security E2E | `security.e2e-spec.ts` | **PASS** |
| TypeScript Compiler | All 4 packages | **PASS** |
| DB Performance Indexes | `pnpm db:migrate` | **PASS** |
| Mobile Production Config | `expo config` | **PASS** |

### Step 19 Implementation Details
- **Security & Auth Hardening:** Added absolute caps to pagination (`limit`), 5MB strict size limit to payloads, subscription idempotency checks, and validation for R2 path traversal.
- **Rate Limiting:** Configured granular limits via `@nestjs/throttler` (e.g. 10 req/h for AI evaluation, 10 req/min for login, 5 req/min for subscriptions).
- **Database Performance:** Added missing B-Tree composite indexes for `UsageRecord`, `QuizAttempt`, and `MainsSubmission` to prevent sequential scans under production load.
- **Mobile Security Audit:** Configured strict iOS `bundleIdentifier`, Android `package`, injected native permission manifests (Camera/Storage) explicitly into `app.json`, and verified environment variable isolation.
- **Test Integrity:** All 92 backend tests across 25 suites are passing, including newly introduced unauthenticated access and payload capping checks.

---

## Step 18 Final Verification (2026-08-13)

| Suite | Tests / Checks | Result |
|-------|----------------|--------|
| Backend unit & E2E tests | 85 / 85 | **PASS** |
| TypeScript Compiler (`pnpm typecheck`) | All 4 packages | **PASS** |
| Expo SDK 54 Configuration Verification | `expo config` | **PASS** (newArchEnabled: true) |
| Android Metro Bundle Export | `expo export --platform android` | **PASS** (1 bundle, 5.24 MB) |
| iOS Metro Bundle Export | `expo export --platform ios` | **PASS** (1 bundle, 5.23 MB) |
| Legacy DB Isolation Check | 0 Firestore/RTDB direct imports/reads | **PASS** |

### Step 18 Implementation Details
- **Dependency Integrity**: Verified complete package dependency consistency by running `pnpm install` at root.
- **Type Safety**: Verified TypeScript compilation for all workspace packages (`@aarambh360/types`, `@aarambh360/mobile`, `@aarambh360/backend`, `@aarambh360/admin`) with zero compile errors.
- **Backend Test Integrity**: Verified all 85 unit and integration/E2E test cases on backend remain fully passing across 24 test suites.
- **Expo SDK 54 Config**: Confirmed Expo SDK 54 configuration (`apps/mobile/app.json`) is correct and valid (e.g., package config, assets, `newArchEnabled`).
- **Production Bundling**: Generated Metro bundle exports for Android and iOS using Expo CLI with no bundler errors.
- **Legacy Database Isolation**: Eliminated unused Firebase database exports (`db`, `realtimeDB`) from `firebaseConfig.ts` and deleted the obsolete `mainsDB.ts` module, leaving zero direct RTDB/Firestore imports or direct reads in all application source files.

---

## Steps 14–17 Final Verification (2026-08-13)

| Suite | Tests | Result |
|-------|-------|--------|
| Backend unit tests | 53 | **PASS** |
| E2E (content/admin/quiz/storage/mains/rag/evaluation/steps14-17) | 32 | **PASS** |
| **Backend total** | **85/85** | **PASS** |
| Mobile typecheck | — | **PASS** |
| Admin build | — | **PASS** |
| Backend typecheck/build | — | **PASS** |

### Step 14 — Notifications
- `NotificationsModule` — FCM/dev delivery, token registration, preferences, history
- Trigger: Mains evaluation completion
- Mobile: `notificationService.ts`
- Docs: `docs/NOTIFICATIONS-ARCHITECTURE.md`

### Step 15 — Analytics & Personalization
- `AnalyticsModule` — learning events, profile (weak/strong areas), recommendations
- Reuses `ProgressService` (no duplicate progress engine)
- Mobile: `analyticsService.ts`
- Docs: `docs/ANALYTICS-PERSONALIZATION.md`

### Step 16 — Subscriptions / Freemium
- `SubscriptionsModule` — plans, `EntitlementService`, usage tracking, Razorpay/dev payment provider
- Plans seeded: FREE (1 eval/week), PLUS (5/month), PREMIUM (unlimited + ad-free)
- Step 13 integration: `MAINS_EVAL` quota enforced server-side
- Mobile: `subscriptionService.ts`, `SubscriptionScreen.tsx`
- Docs: `docs/SUBSCRIPTIONS-ARCHITECTURE.md`

### Step 17 — Ads
- `AdsModule` — `GET /ads/config` gated by `EntitlementService.removeAds`
- Mobile: `adsService.ts`, `AdBanner.tsx` on `MainHomeScreen`
- Docs: `docs/ADS-ARCHITECTURE.md`

### Migration applied
- `20260813140000_steps_14_17_foundation` — `device_tokens`, `notification_logs`, `learning_events`, preference flags

### Agents used
Lead orchestrator (single session): schema/types → Step 16 entitlements → Steps 14/15 parallel → Step 17 ads → mobile integration → tests/docs.

---

## Step 13 Final Verification (2026-08-13)

| Suite | Tests | Result |
|-------|-------|--------|
| Backend unit tests | 43 | **PASS** |
| `evaluation.e2e-spec.ts` | 3 | **PASS** |
| Prior regression (content/admin/quiz/storage/mains/rag) | 29 | **PASS** |
| **Backend total** | **75/75** | **PASS** |
| Mobile typecheck | — | **PASS** |
| Backend typecheck/build | — | **PASS** |
| `api.openai.com` in mobile | 0 | **PASS** |

### Step 13 implementation

- **AI provider abstraction:** `apps/backend/src/mains/ai/` (dev-stub, Gemini, OpenAI)
- **Evaluation engine:** `apps/backend/src/mains/evaluation/` (RAG retrieval, rubric prompts, JSON validation, async processing)
- **APIs:** `GET /mains/submissions`, `POST /mains/submissions/:id/evaluate`, `GET /mains/submissions/:id/evaluation`
- **Mobile:** `MainScreen.tsx` server evaluation + rubric breakdown modal; `mainsService.ts` evaluate/poll helpers
- **Types:** `packages/types/src/mains-evaluation.ts`
- **Docs:** `docs/MAINS-EVALUATION.md`, `docs/AI-EVALUATION-ARCHITECTURE.md`
- **Route fix:** Content Mains detail moved to `GET /mains/questions/:id` to avoid shadowing `/mains/submissions`

### Migration applied

- `20260813130000_mains_evaluation_fields` — `eval_retry_count`, `eval_error` on `mains_submissions`

### Agents used

Lead agent (single session): provider abstraction, evaluation service, prompts, APIs, mobile integration, tests, documentation.

---

## Steps 11–12 Final Integration Verification (2026-08-13)

| Suite | Tests | Result |
|-------|-------|--------|
| Backend unit tests | 38 | **PASS** |
| `mains.e2e-spec.ts` | 2 | **PASS** |
| `rag.e2e-spec.ts` | 2 | **PASS** |
| Prior regression (content/admin/quiz/storage) | 23 | **PASS** |
| **Backend total** | **65/65** | **PASS** |
| Mobile typecheck | — | **PASS** |
| Admin build | — | **PASS** |
| Backend typecheck/build | — | **PASS** |
| `EXPO_PUBLIC_OPENAI` in mobile | 0 | **PASS** |

### Migrations applied

- `20260813120000_mains_ocr_fields` — OCR retry/error + multi-page image URLs
- `20260813120100_rag_hnsw_index` — HNSW cosine index on embeddings

---

## Steps 7–10 Final Integration Verification (2026-08-13)

| Suite | Tests | Result |
|-------|-------|--------|
| Backend unit tests | 31 | **PASS** |
| `content.e2e-spec.ts` | 13 | **PASS** |
| `admin.e2e-spec.ts` | 3 | **PASS** |
| `quiz.e2e-spec.ts` | 4 | **PASS** |
| `storage.e2e-spec.ts` | 4 | **PASS** |
| **Backend total** | **55/55** | **PASS** |
| Mobile typecheck | — | **PASS** |
| Admin typecheck + build | — | **PASS** |
| Backend build | — | **PASS** |
| Mobile screens Firestore/RTDB imports | 0 | **PASS** |

### Step verification summary

| Step | Status | Evidence |
|------|--------|----------|
| 7 — Mobile API decoupling | ✅ Verified | `apiClient`, auth/content hooks present; zero Firestore/RTDB in `screens/`; `firebase/auth` retained for sign-in only |
| 8 — Quiz & progress | ✅ Verified | E2E: session create → answer → complete → streak/stats/mistakes; user isolation; bookmarks CRUD |
| 9 — Admin CMS | ✅ Verified | E2E: USER→403, EDITOR→200; topic DRAFT→REVIEW→PUBLISHED; audit log + content revision rows |
| 10 — R2 storage | ✅ Verified | E2E: auth required; dev upload URL + confirm; cross-user key rejection; invalid content type rejected |

### Fixes during verification

1. **`admin.e2e-spec.ts`** — Replaced non-functional `overrideGuard(FirebaseAuthGuard)` with `overrideProvider(AuthService)` mock tokens (`editor-token` / `user-token`).
2. **Added `quiz.e2e-spec.ts`** — Integration coverage for quiz/progress/bookmarks (previously missing).
3. **Added `storage.e2e-spec.ts`** — Integration coverage for storage upload/confirm (previously missing).

### Environment

- Docker Postgres: `localhost:5433` (container `aarambh360-postgres`)
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aarambh360?schema=public`

---

## Steps 7–10 Batch — Implementation Status (2026-08-13)

| Step | Status | Highlights |
|------|--------|------------|
| 7 | ✅ | All content screens on NestJS API; zero Firestore/RTDB in `apps/mobile/src/screens/` |
| 8 | ✅ | Quiz/progress/bookmarks backend + mobile `useQuizEngine` end-to-end |
| 9 | ✅ | Full admin CRUD (subjects/topics/lessons/mains/MCQ), publish workflow, AdminAuthProvider, e2e role tests |
| 10 | ✅ | R2 storage module with `@aws-sdk/client-s3` pre-signed URLs + mobile upload service |

### Verification (pre-integration)

| Check | Result |
|---|---|
| Backend unit tests | **31/31 PASS** |

### Final integration verification (2026-08-13)

| Check | Result |
|---|---|
| Full backend regression (unit + e2e) | **55/55 PASS** |
| `content.e2e-spec.ts` | **13/13 PASS** |
| `admin.e2e-spec.ts` | **3/3 PASS** |
| `quiz.e2e-spec.ts` | **4/4 PASS** |
| `storage.e2e-spec.ts` | **4/4 PASS** |
| Backend typecheck/build | **PASS** |
| Mobile typecheck | **PASS** |
| Admin typecheck/build | **PASS** |
| Mobile screens Firebase DB imports | **0** |

---

## Step 6 — Core Content APIs

| Workstream | Agent | Status | Files | Result |
|---|---|---|---|---|
| Shared DTOs | Lead agent | **Completed** | `packages/types/src/content.ts` | Response + entity DTOs |
| Exam / cutoffs / exam-info | API sub-agent | **Completed** | `apps/backend/src/exam/` | 5 endpoints |
| Learn (topics, lessons) | API sub-agent | **Completed** | `apps/backend/src/learn/` | 4 endpoints |
| Syllabus tree + cache | API sub-agent | **Completed** | `apps/backend/src/syllabus/` | 1 endpoint, 5 min cache |
| Questions / PYQ / NCERT / materials / mains | API sub-agent | **Completed** | `apps/backend/src/content/` | 9 endpoints |
| Swagger | Lead agent | **Completed** | `main.ts` | `/api/docs` |
| Integration tests | QA sub-agent | **Completed** | `test/content.e2e-spec.ts` | 13 tests pass |
| Documentation | Lead agent | **Completed** | `docs/API-CONTENT.md` | Full endpoint reference |

### Endpoint inventory (19 routes)

| Method | Path | Auth |
|---|---|---|
| GET | `/exams` | Public |
| GET | `/exams/:code` | Public |
| GET | `/exams/:code/subjects` | Public |
| GET | `/subjects/:id/topics` | Protected |
| GET | `/topics/:id` | Public |
| GET | `/topics/:id/lessons` | Public |
| GET | `/lessons/:id` | Public |
| GET | `/syllabus/:examCode/tree` | Public |
| GET | `/exam-info/:examCode` | Public |
| GET | `/cutoffs/:examCode` | Public |
| GET | `/questions` | Public |
| GET | `/questions/:id` | Public |
| GET | `/pyq` | Public |
| GET | `/pyq/:id` | Public |
| GET | `/ncert` | Public |
| GET | `/study-materials` | Public |
| GET | `/study-materials/:id` | Public |
| GET | `/mains` | Public |
| GET | `/mains/:id` | Public |

### Step 6 verification (2026-08-13)

| Check | Result |
|---|---|
| Backend typecheck | **PASS** |
| Backend build | **PASS** |
| Unit + integration tests | **29/29 PASS** |
| Seeded data via API | **PASS** (2327 questions, 67 syllabus nodes, etc.) |
| Step 4 auth regression | **PASS** |
| Swagger at `/api/docs` | **PASS** |

---

## Step 5 — Legacy Data Seeding & Content Normalization

| Workstream | Agent | Status | Files | Result |
|---|---|---|---|---|
| Legacy data audit | Explore sub-agent | **Completed** | `docs/LEGACY-DATA-INVENTORY.md` | RTDB paths inventoried; Firestore user data excluded |
| Canonical mapping | Lead agent | **Completed** | `docs/LEGACY-DATA-MAPPING.md` | RTDB → Prisma transformation table |
| Seed pipeline | Lead agent | **Completed** | `prisma/seeds/pipeline.ts`, `prisma/seed.ts` | Idempotent orchestrator |
| Importers | Data sub-agent | **Completed** | `prisma/seeds/importers/*.ts` | MCQs, notes, NCERT, syllabus, exam info, cutoffs, PYQ, mains |
| Normalization utils | Lead agent | **Completed** | `prisma/seeds/utils/index.ts` | Options, answers, dedupe hash, slugify |
| Hardcoded strategy | Lead agent | **Completed** | `prisma/seeds/legacy/strategy-content.ts` | 6 `StudyMaterial` rows seeded |
| Reference data | Lead agent | **Completed** | `prisma/seeds/reference.ts` | UPSC CSE exam + 3 stages + 6 GS tags |
| RTDB extraction | Lead agent | **Completed** | `scripts/extract-rtdb.ts` | Export saved to `legacy-data/rtdb-export.json` |
| RTDB import | Lead agent | **Completed** | `prisma/seeds/pipeline.ts` | 2,486 rows imported on first run |
| Unit tests | Lead agent | **Completed** | `prisma/seeds/utils/index.spec.ts` | 8 normalization tests + Step 4 auth tests (16 total) |

| Validation | QA sub-agent | **Completed** | `scripts/validate-seed.ts`, `docs/SEED-VALIDATION-REPORT.md` | Row counts + integrity checks |

### Step 5 Import Counters (final — first seed run)

| Metric | Count |
|---|---:|
| Discovered | 2,492 |
| Imported | 2,486 |
| Updated | 6 (strategy, 2nd run reference) |
| Skipped | 0 |
| Rejected | 0 |
| Duplicate | 0 |

**Idempotency verified:** second seed run → `updated=2,404`, row counts unchanged.

### PostgreSQL Row Counts (2026-08-12, post-import)

| Entity | Count |
|---|---:|
| exams | 1 |
| exam_stages | 3 |
| tags | 6 |
| subjects | 2 |
| topics | 6 |
| chapters | 1 |
| lessons | 1 |
| lesson_sections | 1 |
| questions | 2,327 |
| question_options | 9,228 |
| pyq_metadata | 20 |
| mains_questions | 4 |
| cutoff_records | 55 |
| syllabus_nodes | 67 |
| exam_info_sections | 33 |
| study_materials | 6 |
| ncert_references | 0 *(not present in RTDB export)* |

### Warnings

- `ncert_books` node absent from live RTDB export — no NCERT references imported.
- MCQ subjects use numeric RTDB keys (`0`, `1`) rather than named keys (`History`, `Polity`); mapped to `Subject.code` via slugify.

### Unblock Commands (for future re-extraction)

```bash
# apps/backend/.env — add FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
pnpm --filter @aarambh360/backend extract:rtdb
pnpm --filter @aarambh360/backend db:seed
pnpm --filter @aarambh360/backend validate:seed
```

---

## Database Closure Checkpoint — Step 3 Infrastructure Gap Resolution

| Workstream | Status | Files Changed | Result |
|---|---|---|---|
| **Docker PostgreSQL** | **Completed** | `docker-compose.yml` | `pgvector/pgvector:pg16` on host port **5433** |
| **Initial migration** | **Completed** | `prisma/migrations/20260812135211_init/` | Applied cleanly on fresh DB |
| **Seed skeleton** | **Completed** | `prisma/seed.ts` | UPSC CSE exam + 3 stages + 1 info section |
| **DB scripts** | **Completed** | `package.json` `db:*` scripts | migrate, seed, studio, reset |
| **Schema docs** | **Completed** | `docs/DATABASE-SCHEMA.md` | ERD + local dev instructions |
| **NestJS connectivity** | **Completed** | — | `GET /health` → `database: ok` |

### Checkpoint Verification (2026-08-12)

| # | Requirement | Status |
|---|---|---|
| 1 | PostgreSQL dev database configuration | ✅ Docker Compose + `.env.example` (port 5433) |
| 2 | Prisma initial migration | ✅ `20260812135211_init` |
| 3 | `prisma/migrations/` | ✅ Present with `migration_lock.toml` |
| 4 | docker-compose PostgreSQL setup | ✅ `postgres` + optional `adminer` |
| 5 | Prisma seed skeleton | ✅ `prisma/seed.ts` (minimal reference data) |
| 6 | Backend db scripts | ✅ `db:migrate`, `db:migrate:deploy`, `db:seed`, `db:studio`, `db:reset` |
| 7 | DATABASE_URL configuration | ✅ Documented in `.env.example` |
| 8 | Migration against fresh database | ✅ `prisma migrate deploy` succeeded |
| 9 | Minimal seed | ✅ `[seed] Reference exam upserted: UPSC_CSE` |
| 10 | Prisma connectivity from NestJS | ✅ Health endpoint reports `database: ok` |

### Local dev commands

```bash
docker compose up -d postgres
pnpm --filter @aarambh360/backend db:migrate:deploy
pnpm --filter @aarambh360/backend db:seed
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aarambh360?schema=public"
```

---

## Phase: Step 4 - Backend Auth & Firebase Admin Integration

| Workstream | Assigned Agent | Status | Files Changed | Tests & Checks Performed | Blockers / Notes |
|---|---|---|---|---|---|
| **1. Auth Architecture** | Lead Agent | **Completed** | `apps/backend/src/auth/*` | Firebase Admin + guard + login/me endpoints | Single canonical auth module |
| **2. Users Module** | Lead Agent | **Completed** | `apps/backend/src/users/*` | PATCH/DELETE `/users/me` | Soft delete + Firebase Auth deletion |
| **3. Backend Infrastructure** | Lead Agent | **Completed** | `config/`, `common/filters/`, `main.ts`, `app.module.ts` | ConfigModule, ValidationPipe, exception filter, Throttler | CORS via `CORS_ORIGIN` |
| **4. Shared Auth DTOs** | Lead Agent | **Completed** | `packages/types/src/auth.ts` | Types package typecheck ✅ | Aligned with API responses |
| **5. Security** | Lead Agent | **Completed** | Throttler on auth routes, global guard, `@Public()` | Rate limits: login 10/min, delete 3/min | Firebase credentials via env only |
| **6. Health / Readiness** | Lead Agent | **Completed** | `GET /health`, `GET /health/ready` | Reports database + firebase config status | Public routes |
| **7. Unit Tests** | Lead Agent | **Completed** | `auth.service.spec.ts`, `firebase-auth.guard.spec.ts` | 7 tests passed | Mocked Prisma + Firebase Admin |
| **8. Documentation** | Lead Agent | **Completed** | `docs/API-AUTH.md` | Endpoints, errors, lifecycle documented | Password reset stays client-side |

### Step 4 Endpoints Delivered

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | Public (Bearer required) | Verify Firebase token, upsert PostgreSQL user |
| `GET` | `/auth/me` | Protected | Return user, profile, preferences, entitlements stub |
| `PATCH` | `/users/me` | Protected | Update aspirant profile |
| `DELETE` | `/users/me` | Protected | Soft-delete account + Firebase Auth deletion |
| `GET` | `/health/ready` | Public | Readiness checks (database + firebase) |

### Step 4 Verification Results

| Check | Result |
|---|---|
| `prisma validate` | **PASS** |
| `@aarambh360/backend` typecheck | **PASS** |
| `@aarambh360/backend` build | **PASS** |
| `@aarambh360/backend` jest (7 tests) | **PASS** |
| `@aarambh360/types` typecheck | **PASS** |
| `@aarambh360/admin` typecheck | **PASS** (regression) |
| `@aarambh360/mobile` typecheck | **PASS** (regression) |
| Premature feature APIs | **PASS** — none added |
| Legacy imports | **PASS** — 0 occurrences |

### Step 4 Architectural Decisions

1. **Firebase Auth retained on mobile** — backend verifies ID tokens via `firebase-admin`, never stores passwords.
2. **Global `FirebaseAuthGuard`** with `@Public()` opt-out for health/login routes.
3. **`POST /auth/login` required once** after sign-in to provision PostgreSQL identity records before `/auth/me`.
4. **Soft delete** sets `users.deletedAt`; deleted users blocked on login and protected routes.
5. **Entitlements stub** returns `[]` until Step 15 subscriptions work.
6. **PostgreSQL migration** applied in Step 3 database closure checkpoint (`20260812135211_init`).

### Step 4 Documentation Index

| Document | Purpose |
|---|---|
| `docs/API-AUTH.md` | Auth endpoints, headers, errors, user lifecycle |
| `apps/backend/.env.example` | Firebase Admin + DATABASE_URL template |

---

## Phase: Step 3 - Production Database & Domain Architecture

| Workstream | Assigned Agent | Status | Files Changed | Tests & Checks Performed | Blockers / Notes |
|---|---|---|---|---|---|
| **1. Domain Modeling** | Lead Agent | **Completed** | `docs/STEP-3-DOMAIN-MODEL.md` | Domain-first design reconciled with legacy audits | One canonical domain model |
| **2. PostgreSQL Architecture** | Lead Agent | **Completed** | `docs/STEP-3-POSTGRESQL-ARCHITECTURE.md` | UUID, indexes, soft-delete, versioning documented | None |
| **3. Firebase Mapping** | Sub-Agent | **Completed** | `docs/STEP-3-FIREBASE-MAPPING.md` | Firestore + RTDB → PostgreSQL mapping (no migration) | Firebase Auth retained |
| **4. pgvector / RAG Prep** | Lead Agent | **Completed** | `docs/STEP-3-PGVECTOR-RAG.md`, `RagDocument/RagChunk/RagEmbedding` models | RAG pipeline explicitly out of scope | Extension SQL deferred to Step 12 |
| **5. Prisma Implementation** | Lead Agent | **Completed** | `apps/backend/prisma/schema.prisma` (59 models, 19 enums) | `prisma validate` ✅, `prisma generate` ✅ | Requires `DATABASE_URL` for validate |
| **6. Backend Integration** | Lead Agent | **Completed** | `apps/backend/src/prisma/*`, `app.module.ts`, `app.service.ts`, `.env.example` | `tsc --noEmit` ✅, `nest build` ✅ | Prisma connects only when `DATABASE_URL` set |
| **7. Shared Types** | Lead Agent | **Completed** | `packages/types/src/domain.ts`, `index.ts` | `tsc --noEmit` ✅ | Enums aligned with Prisma schema |
| **8. Master Roadmap** | Sub-Agent | **Completed** | `docs/AARAMBH360-ROADMAP.md` | 20-step permanent roadmap with full sections | Step 3 marked COMPLETE |
| **9. QA Review** | Lead Agent | **Completed** | Schema + integration review | All 11 domains covered; no premature CRUD APIs | See QA notes below |
| **10. DB Infrastructure (closure)** | Lead Agent | **Completed** | `docker-compose.yml`, `prisma/migrations/`, `prisma/seed.ts`, `db:*` scripts, `DATABASE-SCHEMA.md` | Migration + seed on fresh DB ✅ | Port 5433 (5432 in use locally) |

### Step 3 Domain Coverage Checklist

| Domain | PostgreSQL Entities | Status |
|---|---|---|
| Identity | `User`, `Profile`, `UserPreference`, `OnboardingProgress`, `UserExamPreference` | ✅ |
| Exam structure | `Exam`, `ExamStage`, `Subject`, `Topic`, `SyllabusNode`, `CutOffRecord`, `ExamInfoSection` | ✅ |
| Learning content | `Chapter`, `Lesson`, `LessonSection`, `NcertReference`, `StudyMaterial` | ✅ |
| Questions | `Question`, `QuestionOption`, `Tag`, `QuestionTag`, `QuestionTopicMap`, `QuestionVersion` | ✅ |
| PYQs | `PyqMetadata` (+ `Question`) | ✅ |
| Quizzes | `Quiz`, `QuizQuestion`, `QuizAttempt`, `QuizAttemptAnswer` | ✅ |
| Progress | `QuestionAttempt`, `LessonProgress`, `TopicProgress`, `StudySession`, `DailyActivity`, `UserStreak`, `Bookmark`, `Mistake`, `SavedQuestion` | ✅ |
| Mains | `MainsQuestion`, `MainsSubmission`, `MainsAnswer`, `MainsEvaluation` | ✅ |
| Current affairs | `CurrentAffairsSource`, `CurrentAffairsCategory`, `CurrentAffairsArticle`, `ArticleTag`, `ArticleExamMapping`, `ArticleBookmark` | ✅ |
| Freemium/premium | `Plan`, `Feature`, `PlanFeature`, `Subscription`, `UserEntitlement`, `UsageRecord` | ✅ |
| Admin/audit | `AuditLog`, `ContentRevision`, `QuestionReport` | ✅ |
| RAG prep (future) | `RagDocument`, `RagChunk`, `RagEmbedding` | ✅ |

### Step 3 Verification Results

| Check | Result |
|---|---|
| `prisma validate` (with `DATABASE_URL`) | **PASS** |
| `prisma generate` | **PASS** — Prisma Client v6.19.3 |
| `prisma migrate deploy` (fresh DB) | **PASS** — `20260812135211_init` |
| `prisma db seed` | **PASS** — UPSC CSE reference row |
| `@aarambh360/backend` typecheck | **PASS** |
| `@aarambh360/backend` build | **PASS** |
| `@aarambh360/backend` jest (7 tests) | **PASS** (Step 4 regression) |
| `@aarambh360/types` typecheck | **PASS** |
| NestJS `GET /health` database check | **PASS** — `database: ok` |
| Premature CRUD APIs | **PASS** — none added |
| Destructive production migrations | **PASS** — local dev only |

### Step 3 QA Notes (Resolved)

1. ~~**First migration deferred**~~ — **Resolved:** initial migration applied via `prisma migrate deploy`.
2. **`pgvector` extension** — enabled in migration SQL (`CREATE EXTENSION vector`) using `pgvector/pgvector:pg16` image.
3. **Local port** — host port **5433** used because port 5432 is occupied by another Docker project.
4. **`BookmarkTargetType.MAINS_QUESTION`** — still deferred to Mains bookmark API (Step 8+).

### Step 3 Documentation Index

| Document | Purpose |
|---|---|
| `docs/AARAMBH360-ROADMAP.md` | Permanent master roadmap (20 steps) |
| `docs/STEP-3-DOMAIN-MODEL.md` | Canonical domain model & ER diagram |
| `docs/STEP-3-POSTGRESQL-ARCHITECTURE.md` | PostgreSQL design decisions |
| `docs/STEP-3-FIREBASE-MAPPING.md` | Firebase → PostgreSQL mapping |
| `docs/STEP-3-PGVECTOR-RAG.md` | pgvector/RAG preparation |
| `apps/backend/prisma/schema.prisma` | Canonical Prisma schema |
| `docs/DATABASE-SCHEMA.md` | Schema overview + local dev workflow |
| `docker-compose.yml` | Local PostgreSQL 16 + pgvector + Adminer |
| `apps/backend/prisma/migrations/` | Initial migration SQL |
| `apps/backend/prisma/seed.ts` | Minimal reference seed |

---

## Phase: Step 2 - Production Monorepo Foundation & Multi-Package Scaffolding

| Workstream | Assigned Agent | Status | Files Changed | Tests & Checks Performed | Blockers / Notes |
|---|---|---|---|---|---|
| **1. Monorepo Root & Shared Types** | Sub-Agent 1 | **Completed** | `pnpm-workspace.yaml`, `package.json`, `turbo.json`, `.gitignore`, `README.md`, `packages/types/*` | `pnpm install`, `pnpm --filter @aarambh360/types typecheck` | None |
| **2. Mobile Foundation & UI** | Sub-Agent 2 | **Completed** | `apps/mobile/*` (19 screens, assets, App.tsx) | `pnpm --filter @aarambh360/mobile typecheck`, `expo config`, Android/iOS Metro bundles | 100% self-contained |
| **3. NestJS Backend Foundation** | Sub-Agent 3 | **Completed** | `apps/backend/*` (main.ts, app.module.ts, etc.) | `pnpm --filter @aarambh360/backend build`, `GET /health` -> 200 OK | Clean shell |
| **4. Next.js Admin Shell** | Sub-Agent 4 | **Completed** | `apps/admin/*` (layout.tsx, page.tsx, Tailwind) | `pnpm --filter @aarambh360/admin build` | Clean shell |
| **5. QA & Integration Audit** | Sub-Agent 5 | **Completed** | All workspace packages | Monorepo build, isolation check (0 legacy imports), runtime bundle tests | **Step 2 Verified** |

---

## Pinned Version Registry (Step 2)
- **Node Runtime**: `v22.22.3`
- **Package Manager**: `pnpm 11.6.0` (with `pnpm-workspace.yaml`)
- **Monorepo Engine**: `turbo ^2.3.4`
- **Mobile Stack**:
  - `expo`: `~54.0.23`
  - `react`: `19.1.0`
  - `react-native`: `0.81.5`
  - `@react-navigation/native`: `^7.1.19`
  - `@react-navigation/native-stack`: `^7.6.2`
  - `@react-navigation/bottom-tabs`: `^7.8.4`
  - `react-native-webview`: `^13.13.2`
  - `firebase`: `^12.5.0` (Client auth & temporary connection)
- **Backend Stack**:
  - `@nestjs/core`: `^11.0.1`
  - `@nestjs/common`: `^11.0.1`
  - `@nestjs/platform-express`: `^11.0.1`
  - `rxjs`: `^7.8.1`
  - `reflect-metadata`: `^0.2.2`
  - `typescript`: `^5.7.3`
- **Admin Stack**:
  - `next`: `15.1.7`
  - `react`: `19.0.0`
  - `react-dom`: `19.0.0`
  - `tailwindcss`: `^3.4.17`
  - `postcss`: `^8.4.49`
  - `autoprefixer`: `^10.4.20`
  - `typescript`: `^5.7.3`

---

## Screen Inventory Reconciliation (Mobile App)

Total Screen Files in `apps/mobile/src/screens/`: **19**  
Total Navigable Screens Registered in `apps/mobile/App.tsx`: **19** (100% registered, 0 unused/auxiliary screens).

| # | Screen Name | File Location | Navigation Route Key | Purpose | Status |
|---|---|---|---|---|---|
| 1 | **LoginScreen** | `src/screens/LoginScreen.tsx` | `Login` | Email/password sign-in | Active & Registered |
| 2 | **SignupScreen** | `src/screens/signupScreen.tsx` | `Signup` | User profile setup | Active & Registered |
| 3 | **MainHomeScreen** | `src/screens/MainHomeScreen.tsx` | `MainHomeScreen` | Exam category selector hub | Active & Registered |
| 4 | **ExamHomeScreen** | `src/screens/ExamHomeScreen.tsx` | `ExamHomeScreen` | UPSC preparation dashboard | Active & Registered |
| 5 | **MCQScreen** | `src/screens/MCQScreen.tsx` | `MCQScreen` | Prelims subject/class/count selector | Active & Registered |
| 6 | **QuizScreen** | `src/screens/QuizScreen.tsx` | `QuizScreen` | Interactive MCQ quiz engine & timer | Active & Registered |
| 7 | **QuizResultScreen** | `src/screens/QuizResultScreen.tsx` | `QuizResultScreen` | Score gauge, review & streak popup | Active & Registered |
| 8 | **ChapterScreen** | `src/screens/ChapterScreen.tsx` | `ChapterScreen` | Chapter reader + micro-quiz | Active & Registered |
| 9 | **NotesScreen** | `src/screens/NoteScreen.tsx` | `NotesScreen` | NCERT subjects & chapters directory | Active & Registered |
| 10 | **NcertScreen** | `src/screens/NcertScreen.tsx` | `NcertScreen` | Classwise NCERT textbook PDF bank | Active & Registered |
| 11 | **SyllabusScreen** | `src/screens/SyllabusScreen.tsx` | `SyllabusScreen` | Recursive UPSC Prelims/Mains tree | Active & Registered |
| 12 | **CutOffScreen** | `src/screens/CutOffScreen.tsx` | `CutOffScreen` | Historical UPSC cut-offs table | Active & Registered |
| 13 | **StreakScreen** | `src/screens/StreakScreen.tsx` | `StreakScreen` | Monthly study streak matrix | Active & Registered |
| 14 | **ProfileScreen** | `src/screens/ProfileScreen.tsx` | `ProfileScreen` | Aspirant profile & study metrics | Active & Registered |
| 15 | **MainScreen** | `src/screens/MainScreen.tsx` | `MainScreen` | Daily Mains writing, OCR & eval | Active & Registered |
| 16 | **PYQScreen** | `src/screens/pyqScreen.tsx` | `PYQScreen` | Previous Year Questions explorer | Active & Registered |
| 17 | **ExamInfoScreen** | `src/screens/examinfoScreen.tsx` | `ExamInfoScreen` | UPSC pattern, dates & eligibility | Active & Registered |
| 18 | **StrategyScreen** | `src/screens/StrategyScreen.tsx` | `StrategyScreen` | Prelims, Mains & Interview strategy | Active & Registered |
| 19 | **NewsScreen** | `src/screens/NewsScreen.tsx` | `NewsScreen` | Daily current affairs reader | Active & Registered |

Auxiliary Style Modules:
- `src/screens/styles/QuizScreen.styles.ts`: Shared quiz styling module.

---

## Detailed Step 2 Verification Results

### 1. Monorepo Discovery
- **Status**: **PASSED**
- All 4 packages (`@aarambh360/admin`, `@aarambh360/backend`, `@aarambh360/mobile`, `@aarambh360/types`) linked cleanly via `pnpm-workspace.yaml`.

### 2. Legacy Isolation Check
- **Status**: **PASSED (0 occurrences)**
- Zero imports, references, symlinks, or aliases pointing to `legacy-Aarambh360/` across the entire codebase.

### 3. Workspace Typecheck & Build
- `pnpm typecheck` (`turbo typecheck`): 4/4 packages passed (0 errors).
- `pnpm build` (`turbo build`): 4/4 packages passed (0 errors).

### 4. Mobile Runtime & Metro Bundler Verification
- **Android Metro Bundle**: `expo export --platform android` $\rightarrow$ Bundled 1,141 modules in 1.7s (**PASS, 0 errors**).
- **iOS Metro Bundle**: `expo export --platform ios` $\rightarrow$ Bundled 1,141 modules in 1.7s (**PASS, 0 errors**).
- **Configuration**: Validated against Expo SDK 54 (`newArchEnabled: true`).
- **Asset Integrity**: 100% of app icons, splash screens, and rich text editor assets resolved cleanly.

### 5. Backend Runtime Verification
- **Runtime Test**: Started `node dist/main.js` on port 4000.
- **GET http://localhost:4000/health**: `200 OK` $\rightarrow$ `{"status":"ok","timestamp":"2026-08-12T12:40:13.170Z"}`.
- **GET http://localhost:4000/**: `200 OK` $\rightarrow$ `{"name":"Aarambh360 API","version":"1.0.0","status":"online"}`.

### 6. Admin Portal Build Verification
- **Next.js Build**: Compiled and statically generated App Router pages with Tailwind CSS (**PASS, 0 errors**).
