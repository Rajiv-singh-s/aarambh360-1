# Step 3: Firebase to PostgreSQL Mapping

**Source of truth:** `apps/backend/prisma/schema.prisma`  
**Related audits:** `FIREBASE-AUDIT.md`, `DATA-AUDIT.md`, `ARCHITECTURE-GAP.md`

This document maps every Firebase collection and Realtime Database (RTDB) path from the legacy application to the proposed PostgreSQL entities. **Mapping only** — no migration scripts are defined here.

### Legend

| Symbol | Meaning |
|--------|---------|
| **RETAIN** | Firebase service stays (Auth, FCM, Analytics) |
| **REPLACE** | Data moves to PostgreSQL |
| **NEW** | No legacy equivalent; greenfield in PostgreSQL |
| **DERIVED** | Computed at query time, not stored in Firebase today |

---

## 1. Firebase Services (Non-Data)

| Firebase Service | Production Role | PostgreSQL Impact |
|------------------|-----------------|-------------------|
| **Firebase Authentication** | RETAIN — client auth, NestJS verifies JWT | `User.firebaseUid` bridges identity |
| **Firebase Cloud Messaging** | RETAIN — push notifications | No table; device tokens stored separately (future) |
| **Firebase Analytics** | RETAIN / ENHANCE | No table; event tracking external |
| **Firebase Storage** | REPLACE → Cloudflare R2 | `imageUrl`, `avatarUrl`, `pdfUrl`, `mindmapUrl` columns |
| **Firebase Functions** | REPLACE → NestJS backend | N/A |
| **Firestore** | REPLACE → PostgreSQL | See Section 2 |
| **Realtime Database** | REPLACE → PostgreSQL | See Section 3 |

---

## 2. Firestore Collections

### 2.1 `users/{uid}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `uid`, `email`, `name`, `phone`, `dob`, `gender`, `profileCompleted`, `createdAt`, `updatedAt` |
| **PostgreSQL entities** | `User`, `Profile` |
| **Field mapping** | |

| Firestore field | PostgreSQL column | Notes |
|-----------------|-------------------|-------|
| `uid` | `User.firebaseUid` | Unique bridge key |
| `email` | `User.email` | Unique, nullable |
| `phone` | `User.phone` | Unique, nullable |
| `profileCompleted` | `User.profileCompleted` | |
| `createdAt` | `User.createdAt` | ISO → `DateTime` |
| `updatedAt` | `User.updatedAt` | |
| `name` | `Profile.name` | Split to 1:1 Profile |
| `dob` | `Profile.dateOfBirth` | Parse `DD/MM/YYYY` → `@db.Date` |
| `gender` | `Profile.gender` | |
| — | `Profile.targetYear` | NEW — not in legacy |
| — | `Profile.preparationLevel` | NEW — not in legacy |
| — | `Profile.dailyStudyMinutes` | NEW — not in legacy |
| — | `Profile.avatarUrl` | NEW — not in legacy |
| — | `User.role` | NEW — default `USER` |
| — | `UserPreference` | NEW — 1:1 preferences row |
| — | `OnboardingProgress` | NEW — 1:1 onboarding row |

**Transformation considerations:**
- Upsert on first API login: Firebase JWT → find/create `User` by `firebaseUid`
- Date parsing: legacy `dob` string format must be normalized
- No soft-delete in Firestore; migrated users get `deletedAt = NULL`

---

### 2.2 `users/{uid}/quizResults/{resultId}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `subject`, `subjectKey`, `classKey`, `correctCount`, `incorrectCount`, `totalQuestions`, `marks`, `accuracy`, `timeTaken`, `createdAt` |
| **PostgreSQL entities** | `QuizAttempt`, `QuizAttemptAnswer` (partial) |
| **Field mapping** | |

| Firestore field | PostgreSQL column | Notes |
|-----------------|-------------------|-------|
| `correctCount` | `QuizAttempt.correctCount` | |
| `incorrectCount` | `QuizAttempt.incorrectCount` | |
| `totalQuestions` | `QuizAttempt.totalQuestions` | |
| `marks` | `QuizAttempt.score` | String → `Decimal(8,2)` |
| `accuracy` | `QuizAttempt.accuracy` | String → `Decimal(5,2)` |
| `timeTaken` | `QuizAttempt.timeTakenSeconds` | Parse `"04:32"` → seconds |
| `createdAt` | `QuizAttempt.completedAt` | |
| `subject` / `subjectKey` | `Quiz.metadata` | Store legacy keys in JSON |
| `classKey` | `Quiz.metadata` | Store in JSON |
| — | `QuizAttempt.userId` | From parent `uid` |
| — | `QuizAttempt.quizId` | Requires synthetic `Quiz` per subject/class |
| — | `QuizAttempt.status` | Set `COMPLETED` for migrated records |
| — | `QuizAttemptAnswer` | **Not migratable** — legacy has no per-question detail |

**Transformation considerations:**
- Legacy stores aggregate-only results; per-question `QuizAttemptAnswer` rows cannot be reconstructed
- Create placeholder `Quiz` records per `(subjectKey, classKey)` combination for FK integrity
- `QuizAttemptAnswer` remains empty for migrated historical data
- Future attempts write full granularity via NestJS API

---

### 2.3 `users/{uid}/mcqStreaks/{streakId}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `date` (YYYY-MM-DD), `streakCount`, `updatedAt` |
| **PostgreSQL entities** | `UserStreak`, `DailyActivity` |
| **Field mapping** | |

| Firestore field | PostgreSQL column | Notes |
|-----------------|-------------------|-------|
| `streakCount` (latest) | `UserStreak.currentCount` | `streakType = MCQ` |
| `streakCount` (max) | `UserStreak.longestCount` | Compute from history |
| `date` (latest) | `UserStreak.lastActivityDate` | |
| Each `date` entry | `DailyActivity.activityDate` | One row per streak log date |
| — | `DailyActivity.questionsAnswered` | Infer from streak presence (minimum 1) |

**Transformation considerations:**
- Legacy streaks computed client-side; server must recalculate `longestCount` from historical dates
- Only `MCQ` streak type exists in legacy; `STUDY`, `MAINS`, `COMBINED` are NEW
- Post-migration: all streak updates go through server-side atomic validation

---

### 2.4 `users/{uid}/currentStats/mcqStreak`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `streakCount`, `updatedAt` (current live streak) |
| **PostgreSQL entities** | `UserStreak` |
| **Field mapping** | |

| Firestore field | PostgreSQL column | Notes |
|-----------------|-------------------|-------|
| `streakCount` | `UserStreak.currentCount` | `streakType = MCQ` |
| `updatedAt` | `UserStreak.lastActivityDate` | |

**Transformation considerations:**
- Duplicate of latest value in `mcqStreaks` subcollection; deduplicate during migration
- Prefer `currentStats` value if more recent than latest `mcqStreaks` entry

---

### 2.5 `users/{uid}/bookmarks/{bookmarkId}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `subject`, `question`, `options`, `answer`, `explanation`, `createdAt` |
| **PostgreSQL entities** | `Bookmark` |
| **Field mapping** | |

| Firestore field | PostgreSQL column | Notes |
|-----------------|-------------------|-------|
| `createdAt` | `Bookmark.createdAt` | |
| `question` (text) | `Bookmark.questionId` | **Match** to `Question.text` (fuzzy) |
| `subject` | — | Used for matching context only |
| `options`, `answer`, `explanation` | — | **Discarded** — denormalized; resolve via FK |
| — | `Bookmark.userId` | From parent `uid` |
| — | `Bookmark.targetType` | `QUESTION` |
| — | `Bookmark.notes` | NULL (no legacy notes field) |

**Transformation considerations:**
- Legacy denormalizes full question text; migration must fuzzy-match `question` string to `Question.text`
- Unmatched bookmarks logged for manual review; no orphan bookmark rows created
- Lesson bookmarks did not exist in Firestore

---

### 2.6 `reports/{reportId}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `userId`, `subjectKey`, `question`, `reason`, `createdAt` |
| **PostgreSQL entities** | `QuestionReport` |
| **Field mapping** | |

| Firestore field | PostgreSQL column | Notes |
|-----------------|-------------------|-------|
| `userId` | `QuestionReport.userId` | Resolve Firebase UID → `User.id` |
| `reason` | `QuestionReport.reason` | |
| `createdAt` | `QuestionReport.createdAt` | |
| `question` (text) | `QuestionReport.questionId` | Fuzzy-match to `Question.text` |
| `subjectKey` | — | Matching context only |
| — | `QuestionReport.status` | Default `OPEN` |

**Transformation considerations:**
- Same fuzzy-match challenge as bookmarks
- Unmatched reports retained with `questionId` unresolved (requires schema allowance or manual assignment)

---

### 2.7 `leaderboard/{subjectKey}/entries/{entryId}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `userId`, `score`, `accuracy`, `date` |
| **PostgreSQL entities** | DERIVED — no dedicated table |
| **Proposed approach** | |

| Legacy concept | PostgreSQL approach |
|----------------|---------------------|
| Per-subject leaderboard entries | `SELECT` aggregate on `QuizAttempt` joined with `Quiz.metadata->>'subjectKey'` |
| Real-time updates | Redis sorted set cache (future); not in Prisma schema |
| Client-written entries | Eliminated — server computes rankings |

**Transformation considerations:**
- Legacy leaderboard data is client-written and unreliable; do not migrate historical entries
- Post-migration: leaderboard computed from `QuizAttempt` aggregates, optionally cached in Redis

---

## 3. Realtime Database (RTDB) Paths

### 3.1 `/{subjectKey}/` (Root subject nodes)

| Aspect | Detail |
|--------|--------|
| **Legacy structure** | `{ subject: string, classwise: { [classKey]: { class, questions[] } } }` |
| **PostgreSQL entities** | `Exam`, `Subject`, `Topic` |
| **Field mapping** | |

| RTDB path / field | PostgreSQL entity | Notes |
|-------------------|-------------------|-------|
| `subjectKey` (e.g. `History`) | `Subject.code` | Normalize to lowercase slug |
| `subject` (display name) | `Subject.name` | |
| — | `Subject.examId` | Link to `Exam` where `code = 'upsc_cse'` |
| — | `Subject.gsPaper` | Map subject to GS paper (manual mapping table) |
| `classwise/{classKey}` | `Topic` (child) | Class number → child topic under subject |
| `classwise/{classKey}/class` | `Topic.name` | e.g. "Class 11" |
| `classwise/{classKey}/questions` | See 3.2 | |

**Transformation considerations:**
- RTDB subjects are flat root keys; wrap under a single `Exam` record
- Class numbers become child `Topic` nodes (not a separate table)
- `sourceType = LEGACY_RTDB` on migrated subjects and topics

---

### 3.2 `/{subjectKey}/classwise/{classKey}/questions/{index}`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `question`, `options` (array or object), `answer`, `explanation` |
| **PostgreSQL entities** | `Question`, `QuestionOption`, `QuestionTopicMap` |
| **Field mapping** | |

| RTDB field | PostgreSQL column | Notes |
|------------|-------------------|-------|
| `question` | `Question.text` | |
| `explanation` | `Question.explanation` | |
| `options[]` or `options.{A,B,C,D}` | `QuestionOption.text` | Normalize to labeled options |
| `answer` | `QuestionOption.isCorrect` | Complex parsing (text, key, or prefix) |
| — | `Question.type` | `MCQ_SINGLE` |
| — | `Question.sourceType` | `LEGACY_RTDB` |
| — | `QuestionTopicMap.topicId` | Link to class topic from 3.1 |
| Option index / key | `QuestionOption.label` | `A`, `B`, `C`, `D` |
| Option text | `QuestionOption.text` | Strip leading `"A. "` prefixes |

**Transformation considerations:**
- Options format inconsistency (array vs. object) requires normalization logic (same as `QuizScreen.tsx` regex)
- Answer format inconsistency: match by label, exact text, or prefix — log ambiguous cases
- Embedded chapter MCQs (`notes/.../mcq/mcqs`) follow same transformation

---

### 3.3 `notes/{subject}/{chapter}/`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `chapter_title`, `introduction`, `detailed_explanation`, `summary`, `mcq` |
| **PostgreSQL entities** | `Chapter`, `Lesson`, `LessonSection`, `Question`, `QuestionOption` |
| **Field mapping** | |

| RTDB field | PostgreSQL column | Notes |
|------------|-------------------|-------|
| `{subject}` path key | `Subject` (resolved) | Match to subject from 3.1 |
| `{chapter}` path key | `Chapter.slug` | URL-safe slug |
| `chapter_title` | `Chapter.title` | |
| `introduction` | `Chapter.introduction` | |
| `summary` | `Lesson.summary` | One lesson per chapter |
| — | `Lesson.title` | Same as `chapter_title` |
| — | `Lesson.slug` | Same as chapter slug |
| — | `Lesson.content` | Concatenated sections or NULL |
| `detailed_explanation.{section_N}.content` | `LessonSection.content` | One row per section key |
| Section key order | `LessonSection.sortOrder` | Numeric sort from key name |
| — | `LessonSection.title` | Derived from section key or NULL |
| `mcq.mcqs[]` | `Question` + `QuestionOption` | See 3.2 transformation |
| — | `Chapter.sourceType` | `LEGACY_RTDB` |
| — | `Lesson.sourceType` | `LEGACY_RTDB` |

**Transformation considerations:**
- Arbitrary section keys (`section_1`, `description`) become ordered `LessonSection` rows
- Consider converting section content to Markdown during migration
- Chapter-embedded MCQs link to chapter's subject topic (not class topic)

---

### 3.4 `ncert_books/{class_name}/{subject_name}`

| Aspect | Detail |
|--------|--------|
| **Legacy structure** | `{class_name}: { subject_name: pdf_url_string } }` |
| **PostgreSQL entities** | `NcertReference` |
| **Field mapping** | |

| RTDB path / value | PostgreSQL column | Notes |
|-------------------|-------------------|-------|
| `class_name` (e.g. `Class_11`) | `NcertReference.classNumber` | Parse integer from string |
| `subject_name` key | `NcertReference.subjectName` | |
| PDF URL string value | `NcertReference.pdfUrl` | |
| — | `NcertReference.title` | Optional; derive from subject name |

**Transformation considerations:**
- Flatten nested class → subject → URL dictionary into relational rows
- Unique constraint: `(classNumber, subjectName)`

---

### 3.5 `Syllabus/UPSC_Exam/`

| Aspect | Detail |
|--------|--------|
| **Legacy structure** | Deeply nested JSON tree |
| **PostgreSQL entities** | `SyllabusNode` |
| **Field mapping** | |

| RTDB concept | PostgreSQL column | Notes |
|--------------|-------------------|-------|
| Each tree node | `SyllabusNode` row | One row per node |
| Node title/text | `SyllabusNode.title` | |
| Node description | `SyllabusNode.description` | |
| Parent node | `SyllabusNode.parentId` | Adjacency list |
| Node depth order | `SyllabusNode.sortOrder` | Preserve original order |
| Materialized path | `SyllabusNode.path` | e.g. `/gs1/history/ancient` |
| — | `SyllabusNode.examId` | Link to `Exam` where `code = 'upsc_cse'` |
| Matching curriculum topic | `SyllabusNode.topicId` | Optional FK to `Topic` (manual mapping) |

**Transformation considerations:**
- Recursive JSON → adjacency list via tree-walk
- `onDelete: Restrict` on `parentId` — insert parents before children
- Syllabus and curriculum `Topic` trees are parallel; link via `topicId` where possible

---

### 3.6 `Exam info/upsc_cse_2026/` (and variants)

| Aspect | Detail |
|--------|--------|
| **Legacy structure** | Overview, key dates, eligibility, pattern sections |
| **PostgreSQL entities** | `Exam`, `ExamInfoSection` |
| **Field mapping** | |

| RTDB section | PostgreSQL column | Notes |
|--------------|-------------------|-------|
| Exam identifier | `Exam.code` | e.g. `upsc_cse_2026` → `upsc_cse` |
| Each info section | `ExamInfoSection` row | |
| Section name/key | `ExamInfoSection.sectionKey` | e.g. `eligibility`, `pattern` |
| Section title | `ExamInfoSection.title` | |
| Section body | `ExamInfoSection.content` | Convert to Markdown |
| Section order | `ExamInfoSection.sortOrder` | |

**Transformation considerations:**
- Flatten nested JSON sections into individual rows
- Year-specific exam info (2026) maps to base `Exam` with year in section content or metadata

---

### 3.7 `cutoffs/{year}/`

| Aspect | Detail |
|--------|--------|
| **Legacy structure** | `{year}: { category: { prelims, mains, final } }` |
| **PostgreSQL entities** | `CutOffRecord` |
| **Field mapping** | |

| RTDB field | PostgreSQL column | Notes |
|------------|-------------------|-------|
| `{year}` path key | `CutOffRecord.year` | Integer |
| Category key (e.g. `General`, `OBC`) | `CutOffRecord.category` | |
| Prelims value | `CutOffRecord.prelimsCutoff` | `Decimal(6,2)` |
| Mains value | `CutOffRecord.mainsCutoff` | `Decimal(6,2)` |
| Final value | `CutOffRecord.finalCutoff` | `Decimal(6,2)` |
| — | `CutOffRecord.examId` | Link to `Exam` |

**Transformation considerations:**
- Years 2015–2024 in legacy; each year × category = one row
- Unique constraint: `(examId, year, category)`
- Field names may vary across years; normalize during transformation

---

### 3.8 `pyq/{year}/questions/`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `id`, `number`, `question`, `wordLimit`, `marks`, `paper` |
| **PostgreSQL entities** | `Question`, `PyqMetadata`, `QuestionOption` (if MCQ) |
| **Field mapping** | |

| RTDB field | PostgreSQL column | Notes |
|------------|-------------------|-------|
| `question` | `Question.text` | |
| `number` | `PyqMetadata.questionNumber` | |
| `wordLimit` | `PyqMetadata.wordLimit` | Parse `"150 / 250"` → int |
| `marks` | `PyqMetadata.marks` | `Decimal(5,2)` |
| `paper` | `PyqMetadata.paper` | `GsPaper` enum |
| `{year}` path key | `PyqMetadata.examYear` | |
| — | `Question.type` | `PYQ_PRELIMS` or `PYQ_MAINS` based on format |
| — | `Question.sourceType` | `PYQ` |
| — | `Question.examId` | Link to `Exam` |
| `id` (legacy string) | `Question.sourceRef` | Preserve legacy ID |

**Transformation considerations:**
- Only 2025 GS1 exists in legacy; schema supports all years/papers
- Descriptive PYQs (no options) → `PYQ_MAINS` type, no `QuestionOption` rows
- MCQ PYQs → `PYQ_PRELIMS` with options if present
- `modelAnswer` not in legacy RTDB; populated via editorial workflow post-migration

---

### 3.9 `mains/{year}/{month}/{day}/`

| Aspect | Detail |
|--------|--------|
| **Legacy fields** | `question`, `subject`, `paper`, `marks`, `total_attempted` |
| **PostgreSQL entities** | `MainsQuestion` |
| **Field mapping** | |

| RTDB field | PostgreSQL column | Notes |
|------------|-------------------|-------|
| `question` | `MainsQuestion.text` | |
| `subject` | `MainsQuestion.subjectId` | Resolve to `Subject` (fuzzy match) |
| `paper` | `MainsQuestion.gsPaper` | `GsPaper` enum |
| `marks` | `MainsQuestion.maxMarks` | Integer |
| `{year}/{month}/{day}` path | `MainsQuestion.publishedDate` | Compose `@db.Date` |
| `total_attempted` | — | **Discarded** — recompute from `MainsSubmission` count |
| — | `MainsQuestion.publishStatus` | `PUBLISHED` for historical |
| — | `MainsQuestion.examId` | Link to `Exam` |

**Transformation considerations:**
- `total_attempted` counter in RTDB is unreliable; derive from submission counts post-migration
- No legacy submissions or evaluations exist (client-only); `MainsSubmission`, `MainsAnswer`, `MainsEvaluation` are NEW

---

## 4. External Data Sources (Not Firebase)

### 4.1 NewsAPI (`https://newsapi.org/v2/everything`)

| Aspect | Detail |
|--------|--------|
| **Legacy** | Direct client fetch with hardcoded API key |
| **PostgreSQL entities** | `CurrentAffairsArticle`, `CurrentAffairsSource`, `CurrentAffairsCategory` |
| **Transformation** | |

| NewsAPI field | PostgreSQL column |
|---------------|-------------------|
| `title` | `CurrentAffairsArticle.title` |
| `description` | `CurrentAffairsArticle.summary` |
| `content` | `CurrentAffairsArticle.content` |
| `url` | `CurrentAffairsArticle.externalUrl` |
| `urlToImage` | `CurrentAffairsArticle.imageUrl` |
| `publishedAt` | `CurrentAffairsArticle.publishedAt` |
| `source.name` | `CurrentAffairsSource.name` |

**Transformation considerations:**
- No historical NewsAPI data to migrate; start fresh with editorial curation
- `gsTags`, `ArticleExamMapping`, `ArticleTag` populated by editors, not NewsAPI

---

### 4.2 OpenAI Mains Evaluation (client-side)

| Aspect | Detail |
|--------|--------|
| **Legacy** | `evaluateAnswer()` in `MainScreen.tsx` — results in React state only |
| **PostgreSQL entities** | `MainsSubmission`, `MainsAnswer`, `MainsEvaluation` |
| **Transformation** | No data to migrate — entirely NEW capability |

| Legacy state | PostgreSQL column |
|--------------|-------------------|
| Answer image (base64) | `MainsAnswer.imageUrl` (R2 URL) |
| Extracted text | `MainsAnswer.extractedText` |
| Score | `MainsEvaluation.score` |
| Feedback | `MainsEvaluation.feedbackJson` |

---

## 5. New PostgreSQL Entities (No Firebase Equivalent)

| Entity | Purpose |
|--------|---------|
| `UserPreference` | Theme, language, notification settings |
| `OnboardingProgress` | Multi-step onboarding tracker |
| `UserExamPreference` | Target exam selection |
| `ExamStage` | Prelims/Mains/Interview stages |
| `StudyMaterial` | Supplementary materials |
| `Tag`, `QuestionTag`, `ArticleTag` | Tagging system |
| `QuestionVersion` | Question edit history |
| `Quiz`, `QuizQuestion` | Structured quiz containers |
| `QuizAttemptAnswer` | Per-question quiz answers |
| `QuestionAttempt` | Standalone practice attempts |
| `LessonProgress`, `TopicProgress` | Learning progress |
| `StudySession`, `DailyActivity` | Activity tracking |
| `SavedQuestion` | Lightweight save list |
| `Plan`, `Feature`, `PlanFeature` | Subscription plans |
| `Subscription`, `UserEntitlement`, `UsageRecord` | Billing and quotas |
| `AuditLog`, `ContentRevision` | Admin audit trail |
| `ArticleBookmark` | Current affairs bookmarks |
| `RagDocument`, `RagChunk`, `RagEmbedding` | Future RAG (see `STEP-3-PGVECTOR-RAG.md`) |

---

## 6. Summary Mapping Table

| Firebase path / collection | PostgreSQL entity(ies) | Migration complexity |
|----------------------------|------------------------|---------------------|
| `users/{uid}` | `User`, `Profile`, `UserPreference` | Low |
| `users/{uid}/quizResults/{id}` | `QuizAttempt` (no per-answer detail) | Medium |
| `users/{uid}/mcqStreaks/{id}` | `UserStreak`, `DailyActivity` | Low |
| `users/{uid}/currentStats/mcqStreak` | `UserStreak` | Low (deduplicate) |
| `users/{uid}/bookmarks/{id}` | `Bookmark` | Medium (fuzzy match) |
| `reports/{id}` | `QuestionReport` | Medium (fuzzy match) |
| `leaderboard/{subject}/entries/{id}` | DERIVED from `QuizAttempt` | N/A (do not migrate) |
| `/{subjectKey}/` | `Subject`, `Topic` | Medium |
| `/{subjectKey}/classwise/{class}/questions/` | `Question`, `QuestionOption`, `QuestionTopicMap` | High (normalize options) |
| `notes/{subject}/{chapter}/` | `Chapter`, `Lesson`, `LessonSection`, `Question` | High (flatten JSON) |
| `ncert_books/{class}/{subject}` | `NcertReference` | Low |
| `Syllabus/UPSC_Exam/` | `SyllabusNode` | Medium (tree walk) |
| `Exam info/upsc_cse_2026/` | `ExamInfoSection` | Low |
| `cutoffs/{year}/` | `CutOffRecord` | Low |
| `pyq/{year}/questions/` | `Question`, `PyqMetadata` | Medium |
| `mains/{y}/{m}/{d}/` | `MainsQuestion` | Low |
| NewsAPI articles | `CurrentAffairsArticle` | N/A (fresh start) |
| Client Mains eval | `MainsSubmission`, `MainsAnswer`, `MainsEvaluation` | N/A (new capability) |
| — | `Plan`, `Subscription`, `UserEntitlement` | N/A (new capability) |

---

## Related Documents

- Domain model: `STEP-3-DOMAIN-MODEL.md`
- PostgreSQL architecture: `STEP-3-POSTGRESQL-ARCHITECTURE.md`
- RAG preparation: `STEP-3-PGVECTOR-RAG.md`
