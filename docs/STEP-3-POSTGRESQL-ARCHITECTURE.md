# Step 3: PostgreSQL Architecture

**Source of truth:** `apps/backend/prisma/schema.prisma`  
**Related audits:** `FIREBASE-AUDIT.md`, `DATA-AUDIT.md`, `ARCHITECTURE-GAP.md`

This document describes the PostgreSQL database architecture decisions, constraints, indexing strategy, and operational patterns for Aarambh360 production.

---

## 1. Database Stack

| Layer | Technology |
|-------|------------|
| Database | PostgreSQL 15+ |
| ORM | Prisma (`prisma-client-js`) |
| Connection | `DATABASE_URL` environment variable |
| Hosting target | Neon / Supabase / self-managed (TBD) |
| Vector extension | `pgvector` (prepared, not enabled in Step 3 — see `STEP-3-PGVECTOR-RAG.md`) |

---

## 2. UUID Strategy

All primary keys use **UUID v4** generated at insert time.

```prisma
id String @id @default(uuid()) @db.Uuid
```

### Rationale

| Benefit | Explanation |
|---------|-------------|
| **Distributed ID generation** | Mobile clients and seed scripts can generate IDs without coordination |
| **No sequential leakage** | Unlike auto-increment, UUIDs do not expose record counts or creation order |
| **Firebase coexistence** | Firebase UIDs remain on `User.firebaseUid`; PostgreSQL uses its own UUID namespace |
| **Merge-safe migrations** | Legacy data from multiple sources can be seeded without ID collision |

### Conventions

- All FK columns use `@db.Uuid` type annotation
- `entityId` in `AuditLog` and `ContentRevision` is `String` (not `@db.Uuid`) to support polymorphic references across entity types
- No UUID v7/time-sortable IDs in Step 3; time-based ordering uses dedicated timestamp columns

---

## 3. Primary Key / Foreign Key Patterns

### Primary keys

| Pattern | Usage |
|---------|-------|
| Single-column UUID | Most entities (`User`, `Question`, `Lesson`, etc.) |
| Composite PK | Join tables: `QuestionTag`, `QuestionTopicMap`, `QuizQuestion`, `SavedQuestion`, `PlanFeature`, `ArticleTag`, `ArticleExamMapping` |

### Foreign key cascade rules

| Rule | When used | Examples |
|------|-----------|----------|
| **Cascade** | Child is owned by parent; no independent meaning | `Profile` → `User`, `QuestionOption` → `Question`, `LessonSection` → `Lesson`, all user-owned progress tables |
| **Restrict** | Child references must be preserved for data integrity | `QuizQuestion` → `Question`, `QuizAttempt` → `Quiz`, `QuizAttemptAnswer` → `Question`, `QuestionAttempt` → `Question`, `MainsSubmission` → `MainsQuestion` |
| **SetNull** | Optional reference; parent removal should not delete child | `Question.examId` → `Exam`, `SyllabusNode.topicId` → `Topic`, `AuditLog.actorId` → `User`, `selectedOptionId` on attempts |
| **Restrict (hierarchy)** | Prevent deleting parent while children exist | `Topic.parentId`, `SyllabusNode.parentId` |

### Cascade decision matrix

```
User deleted          → Cascade all user-owned data (profile, attempts, bookmarks, subscriptions)
Question deleted      → Cascade options, tags, versions, pyq metadata
                      → Restrict if referenced by quiz_questions or attempts
Exam deleted          → Cascade subjects, stages, syllabus, cutoffs
                      → SetNull on questions/quizzes with optional examId
Lesson deleted        → Cascade sections, lesson_progress
Plan deleted          → Restrict if active subscriptions exist
```

---

## 4. Indexes

### Single-column indexes

| Table | Index | Purpose |
|-------|-------|---------|
| `users` | `firebase_uid` | Auth lookup on every API request |
| `users` | `email` | Login and admin search |
| `users` | `deleted_at` | Filter active users |
| `questions` | `difficulty` | Filter by difficulty |
| `tags` | `category` | Tag browsing |
| `mains_submissions` | `mains_question_id` | Admin review queue |
| `subscriptions` | `provider_sub_id` | Webhook idempotency |
| `rag_embeddings` | `model` | Filter by embedding model |

### Composite indexes (key performance paths)

| Table | Index columns | Query pattern |
|-------|---------------|---------------|
| `user_exam_preferences` | `(user_id, is_primary)` | Get user's primary exam |
| `exam_stages` | `(exam_id, sort_order)` | Ordered stage list |
| `subjects` | `(exam_id, publish_status, sort_order)` | Published subject catalog |
| `topics` | `(subject_id, parent_id, sort_order)` | Topic tree traversal |
| `topics` | `publish_status` | Admin publish queue |
| `syllabus_nodes` | `(exam_id, parent_id, sort_order)` | Syllabus tree |
| `chapters` | `(subject_id, publish_status, sort_order)` | Chapter listing |
| `lessons` | `(chapter_id, publish_status, sort_order)` | Lesson listing |
| `lesson_sections` | `(lesson_id, sort_order)` | Section ordering |
| `questions` | `(type, publish_status)` | Question bank filters |
| `questions` | `(exam_id, source_year)` | PYQ year browsing |
| `question_options` | `(question_id, sort_order)` | Option display order |
| `question_topic_maps` | `topic_id` | Questions by topic |
| `pyq_metadata` | `(exam_year, paper)` | PYQ catalog |
| `quizzes` | `(quiz_type, publish_status)` | Quiz discovery |
| `quiz_questions` | `(quiz_id, sort_order)` | Quiz question order |
| `quiz_attempts` | `(user_id, completed_at DESC)` | User attempt history |
| `quiz_attempts` | `(quiz_id, user_id)` | Per-quiz user stats |
| `question_attempts` | `(user_id, attempted_at DESC)` | Recent practice history |
| `question_attempts` | `(user_id, question_id)` | Per-question history |
| `question_attempts` | `(user_id, is_correct)` | Mistake/weakness queries |
| `lesson_progress` | `(user_id, last_read_at DESC)` | Continue reading |
| `study_sessions` | `(user_id, started_at DESC)` | Session history |
| `daily_activities` | `(user_id, activity_date DESC)` | Activity calendar |
| `bookmarks` | `(user_id, target_type, created_at DESC)` | Bookmark listing |
| `mistakes` | `(user_id, resolved_at)` | Unresolved mistakes |
| `mains_questions` | `(published_date, publish_status)` | Daily mains feed |
| `mains_questions` | `(gs_paper, publish_status)` | Paper-wise browsing |
| `mains_submissions` | `(user_id, submitted_at DESC)` | User submission history |
| `current_affairs_articles` | `(published_at DESC, publish_status)` | News feed |
| `subscriptions` | `(user_id, status)` | Active subscription lookup |
| `usage_records` | `(user_id, feature_id)` | Quota checks |
| `audit_logs` | `(entity_type, entity_id)` | Entity audit trail |
| `audit_logs` | `(actor_id, created_at DESC)` | Admin action log |
| `content_revisions` | `(entity_type, entity_id)` | Revision history |
| `question_reports` | `(status, created_at DESC)` | Admin report queue |
| `cutoff_records` | `(exam_id, year)` | Cutoff lookup |
| `exam_info_sections` | `(exam_id, sort_order)` | Exam info display |
| `ncert_references` | `(class_number, sort_order)` | NCERT catalog |
| `study_materials` | `(material_type, publish_status)` | Material browsing |
| `rag_documents` | `(document_type, is_active)` | RAG document catalog |

---

## 5. Unique Constraints

| Table | Constraint | Purpose |
|-------|------------|---------|
| `users` | `firebase_uid` | One PG user per Firebase account |
| `users` | `email`, `phone` | Unique contact identifiers |
| `profiles` | `user_id` | 1:1 profile |
| `user_preferences` | `user_id` | 1:1 preferences |
| `onboarding_progress` | `user_id` | 1:1 onboarding |
| `user_exam_preferences` | `(user_id, exam_id)` | No duplicate exam selection |
| `exams` | `code` | Stable exam identifier |
| `exam_stages` | `(exam_id, stage_type)` | One stage per type per exam |
| `subjects` | `(exam_id, code)` | Unique subject code per exam |
| `topics` | `(subject_id, slug)` | URL-safe topic identity |
| `chapters` | `(subject_id, slug)` | URL-safe chapter identity |
| `lessons` | `(chapter_id, slug)` | URL-safe lesson identity |
| `question_options` | `(question_id, label)` | No duplicate option labels |
| `tags` | `name` | Global tag uniqueness |
| `question_versions` | `(question_id, version)` | Immutable version numbers |
| `pyq_metadata` | `question_id` | 1:1 PYQ extension |
| `quiz_attempt_answers` | `(attempt_id, question_id)` | One answer per question per attempt |
| `lesson_progress` | `(user_id, lesson_id)` | One progress row per lesson |
| `topic_progress` | `(user_id, topic_id)` | One mastery row per topic |
| `daily_activities` | `(user_id, activity_date)` | One aggregate per day |
| `user_streaks` | `(user_id, streak_type)` | One streak per type |
| `mistakes` | `(user_id, question_id)` | One mistake record per question |
| `mains_answers` | `(submission_id, version)` | Versioned answers |
| `current_affairs_sources` | `name` | Unique source |
| `current_affairs_categories` | `name`, `slug` | Unique category |
| `current_affairs_articles` | `slug` | URL-safe article identity |
| `article_bookmarks` | `(user_id, article_id)` | No duplicate bookmarks |
| `plans` | `code` | Stable plan identifier |
| `features` | `code` | Stable feature identifier |
| `user_entitlements` | `(user_id, feature_id)` | One entitlement per feature |
| `usage_records` | `(user_id, feature_id, period_start)` | One usage row per period |
| `content_revisions` | `(entity_type, entity_id, version)` | Immutable revision numbers |
| `cutoff_records` | `(exam_id, year, category)` | One cutoff per category per year |
| `exam_info_sections` | `(exam_id, section_key)` | Unique section per exam |
| `ncert_references` | `(class_number, subject_name)` | One PDF per class/subject |
| `rag_chunks` | `(document_id, chunk_index)` | Ordered chunks |
| `rag_embeddings` | `chunk_id` | 1:1 embedding per chunk |

---

## 6. Enums

PostgreSQL native enums (via Prisma) enforce valid values at the database level.

| Enum | Values | Used by |
|------|--------|---------|
| `UserRole` | `USER`, `EDITOR`, `MODERATOR`, `ADMIN` | `User.role` |
| `PreparationLevel` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` | `Profile.preparationLevel` |
| `ExamStageType` | `PRELIMS`, `MAINS`, `INTERVIEW` | `ExamStage.stageType` |
| `GsPaper` | `GS1`, `GS2`, `GS3`, `GS4`, `CSAT`, `ESSAY`, `GENERAL` | `Subject`, `PyqMetadata`, `MainsQuestion`, `CurrentAffairsArticle.gsTags` |
| `QuestionType` | `MCQ_SINGLE`, `MCQ_MULTI`, `ASSERTION_REASON`, `PYQ_PRELIMS`, `PYQ_MAINS`, `MAINS_DESCRIPTIVE` | `Question.type` |
| `Difficulty` | `EASY`, `MEDIUM`, `HARD`, `EXPERT` | `Question.difficulty` |
| `PublishStatus` | `DRAFT`, `REVIEW`, `PUBLISHED`, `ARCHIVED` | Content entities |
| `ContentSourceType` | `NCERT`, `PYQ`, `EDITORIAL`, `LEGACY_RTDB`, `LEGACY_FIRESTORE`, `USER_GENERATED` | Content provenance |
| `QuizType` | `PRACTICE`, `MOCK`, `MICRO`, `PYQ`, `CUSTOM` | `Quiz.quizType` |
| `QuizAttemptStatus` | `IN_PROGRESS`, `COMPLETED`, `ABANDONED`, `TIMED_OUT` | `QuizAttempt.status` |
| `MainsSubmissionStatus` | `DRAFT`, `SUBMITTED`, `EVALUATING`, `EVALUATED`, `FAILED` | `MainsSubmission.status` |
| `SubscriptionStatus` | `TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELLED`, `EXPIRED` | `Subscription.status` |
| `BillingProvider` | `RAZORPAY`, `GOOGLE_PLAY`, `APPLE_APP_STORE`, `MANUAL` | `Subscription.billingProvider` |
| `StreakType` | `MCQ`, `STUDY`, `MAINS`, `COMBINED` | `UserStreak.streakType` |
| `StudyActivityType` | `LESSON`, `QUIZ`, `MAINS`, `CURRENT_AFFAIRS`, `REVISION`, `PYQ` | `StudySession.activityType` |
| `AuditAction` | `CREATE`, `UPDATE`, `DELETE`, `PUBLISH`, `ARCHIVE`, `RESTORE` | `AuditLog.action` |
| `ReportStatus` | `OPEN`, `REVIEWING`, `RESOLVED`, `DISMISSED` | `QuestionReport.status` |
| `BookmarkTargetType` | `QUESTION`, `LESSON`, `ARTICLE`, `MAINS_QUESTION` | `Bookmark.targetType` |
| `RagDocumentType` | `NCERT`, `MODEL_ANSWER`, `SYLLABUS`, `EDITORIAL`, `PYQ_ANSWER`, `RUBRIC` | `RagDocument.documentType` |

---

## 7. Timestamps

### Standard pattern

```prisma
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

- Applied to all mutable entities
- Column names use `snake_case` via `@map`
- Prisma `@updatedAt` auto-sets on every update

### Event-specific timestamps

| Column | Entity | Purpose |
|--------|--------|---------|
| `attemptedAt` | `QuestionAttempt` | When user answered |
| `answeredAt` | `QuizAttemptAnswer` | Per-question answer time |
| `startedAt` / `completedAt` | `QuizAttempt`, `StudySession` | Session boundaries |
| `submittedAt` | `MainsSubmission` | Submission time |
| `evaluatedAt` | `MainsEvaluation` | Evaluation completion |
| `publishedAt` | `CurrentAffairsArticle` | Editorial publish date |
| `publishedDate` | `MainsQuestion` | Daily question date (`@db.Date`) |
| `activityDate` | `DailyActivity` | Calendar day (`@db.Date`) |
| `lastActivityDate` | `UserStreak` | Streak calculation (`@db.Date`) |
| `lastReadAt` | `LessonProgress` | Continue-reading pointer |
| `resolvedAt` | `Mistake`, `QuestionReport` | Resolution tracking |
| `expiresAt` / `cancelledAt` | `Subscription`, `UserEntitlement` | Billing lifecycle |

### Date vs. DateTime

- `@db.Date` used where time-of-day is irrelevant (`activityDate`, `publishedDate`, `periodStart`/`periodEnd`)
- `DateTime` used for precise event ordering and audit trails

---

## 8. Soft Deletion

Entities with `deletedAt DateTime?`:

| Entity | Behavior |
|--------|----------|
| `User` | Account deactivation; `deletedAt` indexed for active-user queries |
| `Subject`, `Topic`, `Chapter`, `Lesson` | Content archival; hidden from published catalogs |
| `Question`, `Quiz`, `MainsQuestion` | Content archival; `Restrict` FKs protect attempt history |
| `CurrentAffairsArticle`, `StudyMaterial` | Editorial archival |

### Query convention

```sql
-- Active records only
WHERE deleted_at IS NULL

-- Include archived (admin)
WHERE deleted_at IS NOT NULL OR publish_status = 'ARCHIVED'
```

- Soft delete does **not** cascade; child records remain but should be filtered by parent's `deletedAt` in application queries
- Hard delete reserved for GDPR erasure workflows (separate from soft delete)
- `AuditLog` records `DELETE` and `RESTORE` actions for soft-deleted entities

---

## 9. Versioning

### QuestionVersion

| Field | Type | Purpose |
|-------|------|---------|
| `version` | `Int` | Matches `Question.version` at snapshot time |
| `snapshot` | `Json` | Full question state (text, options, explanation, metadata) |
| `changeNote` | `String?` | Editor annotation |
| `createdBy` | `UUID?` | Editor user ID |

- Unique constraint: `(questionId, version)`
- Created on every publish/edit of a published question
- Enables historical attempt interpretation

### MainsAnswer versions

| Field | Type | Purpose |
|-------|------|---------|
| `version` | `Int` | Incremented on re-upload |
| `isActive` | `Boolean` | Current active answer for evaluation |
| `extractedText` | `String?` | OCR output |
| `imageUrl` | `String?` | R2 object URL |

- Unique constraint: `(submissionId, version)`
- `MainsEvaluation` links to specific `answerId`, preserving evaluation-to-answer-version binding

### ContentRevision (generic)

| Field | Type | Purpose |
|-------|------|---------|
| `entityType` | `String` | e.g. `Lesson`, `CurrentAffairsArticle` |
| `entityId` | `String` | Polymorphic entity reference |
| `version` | `Int` | Incrementing revision number |
| `snapshot` | `Json` | Full entity state at revision time |

- Used for lessons, articles, and other content types not covered by `QuestionVersion`
- Unique constraint: `(entityType, entityId, version)`

---

## 10. Auditability

### AuditLog

Immutable append-only log for admin and system actions.

| Field | Purpose |
|-------|---------|
| `actorId` | Who performed the action (nullable for system) |
| `action` | `AuditAction` enum |
| `entityType` / `entityId` | What was affected |
| `before` / `after` | JSON snapshots of state change |
| `ipAddress` / `userAgent` | Request context |

**Write pattern:** NestJS interceptor or service method writes `AuditLog` row within the same transaction as the entity mutation.

**Read pattern:** Admin dashboard queries by `(entityType, entityId)` or `(actorId, createdAt DESC)`.

### ContentRevision vs. AuditLog

| Concern | Mechanism |
|---------|-----------|
| Editorial rollback | `ContentRevision` / `QuestionVersion` |
| Security/compliance trail | `AuditLog` |
| User-reported issues | `QuestionReport` with status workflow |

---

## 11. Pagination & Query Considerations

### Cursor-based pagination (recommended)

For time-ordered lists (attempts, articles, audit logs):

```sql
SELECT * FROM quiz_attempts
WHERE user_id = $1
  AND (completed_at, id) < ($cursor_completed_at, $cursor_id)
ORDER BY completed_at DESC, id DESC
LIMIT 20;
```

Leverages indexes: `(user_id, completed_at DESC)`.

### Offset pagination (acceptable for small catalogs)

For admin lists and static catalogs (subjects, topics):

```sql
SELECT * FROM subjects
WHERE exam_id = $1 AND deleted_at IS NULL AND publish_status = 'PUBLISHED'
ORDER BY sort_order
LIMIT 50 OFFSET $offset;
```

### Key query patterns

| Use case | Tables | Index used |
|----------|--------|------------|
| Auth user lookup | `users` | `firebase_uid` |
| Published content catalog | `subjects`, `chapters`, `lessons` | `(parent_id, publish_status, sort_order)` |
| Topic question bank | `question_topic_maps` → `questions` | `topic_id`, `(type, publish_status)` |
| User mistake review | `mistakes` → `questions` | `(user_id, resolved_at)` |
| Daily mains feed | `mains_questions` | `(published_date, publish_status)` |
| Active subscription | `subscriptions` | `(user_id, status)` |
| Quota check | `user_entitlements`, `usage_records` | `(user_id, feature_id)` |
| News feed | `current_affairs_articles` | `(published_at DESC, publish_status)` |

### N+1 prevention

- Use Prisma `include` / `select` with nested relations for catalog pages
- Batch-load options for question lists: `QuestionOption WHERE question_id IN (...)`
- Topic tree: single query with `parentId` filter, build tree in application layer

### Aggregation queries

| Metric | SQL pattern |
|--------|-------------|
| Topic mastery | `TopicProgress.masteryPercent` (pre-computed) or `COUNT`/`AVG` on `QuestionAttempt` |
| Daily activity rollup | `DailyActivity` (pre-aggregated on write) |
| Leaderboard | `GROUP BY user_id ORDER BY SUM(score) DESC` on `QuizAttempt` (consider Redis cache) |
| Weak topics | `QuestionAttempt WHERE is_correct = false GROUP BY topic_id` |

---

## 12. Data Integrity Rules

### Application-enforced (NestJS service layer)

| Rule | Enforcement |
|------|-------------|
| Bookmark FK matches `targetType` | Exactly one of `questionId`/`lessonId` non-null per `targetType` |
| Publish workflow | Only `PUBLISHED` content served to mobile clients |
| Quota enforcement | Check `UserEntitlement` before gated API calls |
| Streak validation | Server-side date validation; reject future dates |
| Soft-delete filtering | All public queries include `deletedAt IS NULL` |

### Database-enforced

| Rule | Mechanism |
|------|-----------|
| Referential integrity | FK constraints with cascade/restrict/set-null |
| Unique identities | Unique constraints on codes, slugs, composite keys |
| Enum validity | PostgreSQL enum types |
| Option label uniqueness | `(question_id, label)` unique |
| One answer per quiz question | `(attempt_id, question_id)` unique |
| Version immutability | `(question_id, version)` unique; no UPDATE on `QuestionVersion` |

### Decimal precision

| Column | Type | Usage |
|--------|------|-------|
| `QuizAttempt.score` | `Decimal(8, 2)` | Quiz marks |
| `QuizAttempt.accuracy` | `Decimal(5, 2)` | Percentage |
| `PyqMetadata.marks` | `Decimal(5, 2)` | PYQ marks |
| `MainsEvaluation.score` / `maxScore` | `Decimal(5, 2)` | Evaluation scores |
| `CutOffRecord.*` | `Decimal(6, 2)` | Cutoff marks |

### JSON columns

Used for extensibility without schema migration:

- `Question.metadata`, `Quiz.metadata`, `MainsQuestion.metadata`
- `QuestionVersion.snapshot`, `ContentRevision.snapshot`
- `MainsEvaluation.feedbackJson`, `MainsEvaluation.evaluationMeta`
- `AuditLog.before`, `AuditLog.after`
- `OnboardingProgress.metadata`, `StudySession.metadata`

Validate JSON shape in NestJS DTOs; do not rely on database-level JSON schema validation in Step 3.

---

## 13. Migration & Schema Evolution

| Practice | Detail |
|----------|--------|
| Schema changes | Prisma migrations (`prisma migrate dev` / `prisma migrate deploy`) |
| Seed data | `prisma db seed` for exam catalog, plans, features |
| Legacy provenance | `sourceType = LEGACY_RTDB` or `LEGACY_FIRESTORE` on migrated content |
| pgvector | Deferred to post-Step 3; see `STEP-3-PGVECTOR-RAG.md` |
| Breaking changes | New migration files only; never edit applied migrations |

---

## Related Documents

- Domain model: `STEP-3-DOMAIN-MODEL.md`
- Firebase mapping: `STEP-3-FIREBASE-MAPPING.md`
- RAG preparation: `STEP-3-PGVECTOR-RAG.md`
