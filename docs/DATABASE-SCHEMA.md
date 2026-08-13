# Aarambh360 Database Schema Overview

**Canonical source:** `apps/backend/prisma/schema.prisma`  
**Related docs:** `docs/STEP-3-DOMAIN-MODEL.md`, `docs/STEP-3-POSTGRESQL-ARCHITECTURE.md`

## Summary

| Metric | Value |
|---|---|
| PostgreSQL models | 59 |
| Prisma enums | 19 |
| Primary key strategy | UUID v4 (`@db.Uuid`) |
| ORM | Prisma 6.x |
| Local dev database | Docker PostgreSQL 16 (`docker-compose.yml`) |

## Domain groupings

```mermaid
erDiagram
  User ||--o| Profile : has
  User ||--o| UserPreference : has
  User ||--o| OnboardingProgress : has
  Exam ||--o{ ExamStage : contains
  Exam ||--o{ Subject : contains
  Subject ||--o{ Topic : contains
  Subject ||--o{ Chapter : contains
  Chapter ||--o{ Lesson : contains
  Question ||--o{ QuestionOption : has
  Quiz ||--o{ QuizAttempt : receives
  User ||--o{ QuizAttempt : performs
  MainsQuestion ||--o{ MainsSubmission : receives
  User ||--o{ Subscription : owns
  RagDocument ||--o{ RagChunk : splits
  RagChunk ||--o| RagEmbedding : embeds
```

### Identity
`User`, `Profile`, `UserPreference`, `OnboardingProgress`, `UserExamPreference`

### Exam & curriculum structure
`Exam`, `ExamStage`, `Subject`, `Topic`, `SyllabusNode`, `CutOffRecord`, `ExamInfoSection`

### Learning content
`Chapter`, `Lesson`, `LessonSection`, `NcertReference`, `StudyMaterial`

### Questions & PYQs
`Question`, `QuestionOption`, `Tag`, `QuestionTag`, `QuestionTopicMap`, `QuestionVersion`, `PyqMetadata`

### Quizzes & attempts
`Quiz`, `QuizQuestion`, `QuizAttempt`, `QuizAttemptAnswer`, `QuestionAttempt`

### Progress & engagement
`LessonProgress`, `TopicProgress`, `StudySession`, `DailyActivity`, `UserStreak`, `Bookmark`, `Mistake`, `SavedQuestion`

### Mains evaluation
`MainsQuestion`, `MainsSubmission`, `MainsAnswer`, `MainsEvaluation`

### Current affairs
`CurrentAffairsSource`, `CurrentAffairsCategory`, `CurrentAffairsArticle`, `ArticleTag`, `ArticleExamMapping`, `ArticleBookmark`

### Subscriptions
`Plan`, `Feature`, `PlanFeature`, `Subscription`, `UserEntitlement`, `UsageRecord`

### Audit & moderation
`AuditLog`, `ContentRevision`, `QuestionReport`

### RAG preparation (Step 12 pipeline)
`RagDocument`, `RagChunk`, `RagEmbedding` — `embedding` column uses pgvector via raw SQL migration in Step 12

## Key relationships

| From | To | Rule |
|---|---|---|
| `users.firebase_uid` | Firebase Auth UID | Unique bridge for Step 4 auth |
| `User` | child progress/bookmarks | `onDelete: Cascade` |
| `Question` | `QuizQuestion` | `onDelete: Restrict` on published content |
| `Topic` | self (`parent_id`) | Adjacency-list hierarchy |
| `SyllabusNode` | self (`parent_id`) | Recursive syllabus tree |

## Local development

```bash
# Start PostgreSQL
docker compose up -d postgres

# Apply migrations
pnpm --filter @aarambh360/backend db:migrate:deploy

# Seed minimal reference data
pnpm --filter @aarambh360/backend db:seed
```

Connection string (local):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/aarambh360?schema=public"
```

**Local dev note:** PostgreSQL runs on host port **5433** (not 5432) to avoid conflicts with other local Docker projects. Image: `pgvector/pgvector:pg16` for `RagEmbedding` vector column support.

Adminer UI (optional): http://localhost:8080 — server `postgres`, user `postgres`, password `postgres`, database `aarambh360`.

## Migration conventions

- Migrations live in `apps/backend/prisma/migrations/`
- Initial migration: `00000000000000_init` (generated from canonical schema)
- Do not edit applied migration SQL retroactively
- `RagEmbedding.embedding` (`vector(1536)`) is deferred to Step 12 — Prisma `Unsupported` type until pgvector extension is enabled

## Seed conventions

- Entry point: `apps/backend/prisma/seed.ts`
- Step 3 seed: minimal UPSC CSE exam + stages + one info section (idempotent `upsert`)
- Step 5 seed: legacy RTDB/Firestore normalization (separate workstream)
