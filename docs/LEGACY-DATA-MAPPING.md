# Legacy Data Mapping — RTDB → Prisma

Step 5 canonical transformation map. Schema is defined in `apps/backend/prisma/schema.prisma` (Step 3 — do not redesign).

## Reference Data (Non-RTDB)

| Legacy Source | Prisma Model | Idempotency Key | Notes |
|---|---|---|---|
| UPSC CSE exam metadata | `Exam`, `ExamStage` | `Exam.code = UPSC_CSE` | `seeds/reference.ts` |
| GS paper labels | `Tag` | `Tag.name` (GS1–GS4, CSAT, Essay) | `seeds/reference.ts` |
| Strategy sections (hardcoded) | `StudyMaterial` | `metadata.legacyKey = strategy:{slug}` | `seeds/legacy/strategy-content.ts` |

## RTDB → Prisma Mapping

| RTDB Path | Legacy Shape | Prisma Target | Transformation Rules |
|---|---|---|---|
| `/{subjectKey}` | `{ subject, classwise }` | `Subject` | `code = slugify(subjectKey)`, `name = subject` |
| `/{subjectKey}/classwise/{classKey}` | `{ class, questions }` | `Topic` | `slug = class-{classKey}`, `name = Class {classKey}` |
| `…/questions/{index}` | `{ question, options, answer, explanation }` | `Question`, `QuestionOption`, `QuestionTopicMap` | Normalize options; resolve answer label; dedupe by topic+hash |
| `notes/{subject}/{chapter}` | chapter object | `Chapter`, `Lesson`, `LessonSection` | Skip keys without `"chapter"`; flatten `detailed_explanation` |
| `notes/…/mcq` | `{ mcqs: [] }` or array | `Question` (via topic `class-notes`) | Same MCQ normalizer |
| `ncert_books/{class}/{subject}` | PDF URL string | `NcertReference` | Parse class number from key; upsert by `(classNumber, subjectName)` |
| `Syllabus/UPSC_Exam` | nested object tree | `SyllabusNode` | Adjacency via `parentId`; stable `path` key |
| `Exam info/upsc_cse_2026` | nested sections | `ExamInfoSection` | Flatten to `sectionKey` + content string |
| `cutoffs/{year}/{category}` | `{ Prelim, Main, Final }` | `CutOffRecord` | Parse decimals; skip `"not published"` |
| `pyq/{year}/questions/{id}` | PYQ object | `Question` + `PyqMetadata` | `type = PYQ_MAINS`; map `paper` → `GsPaper` enum |
| `mains/{year}/{month}/{day}` | mains object | `MainsQuestion` | Skip placeholder text; `publishedDate` from path |

## Metadata Conventions

All imported rows include JSON metadata:

```json
{
  "legacyKey": "mcq:History:6:0",
  "legacyPath": "/History/classwise/6/questions/0",
  "legacySource": "LEGACY_RTDB"
}
```

Idempotent re-runs use:

- `metadata.legacyKey` for questions and mains
- Prisma unique constraints for cutoffs, NCERT, exam info sections, subjects
- `SyllabusNode.path` for syllabus tree nodes

## Duplicate Strategy

| Level | Method | Action |
|---|---|---|
| Within import run | `topicId + SHA-256(normalized question text)` | Skip duplicate (`duplicate` counter) |
| Cross-run | `metadata.legacyKey` lookup | Update existing row |
| Low-confidence text-only dupes | Not auto-merged | Preserved as separate rows with distinct legacy keys |

## Rejection Categories

| Reason | Counter |
|---|---|
| Missing question text | `rejected` |
| Fewer than 2 options | `rejected` |
| Unresolvable correct answer | `rejected` |
| Missing NCERT PDF URL | `rejected` |
| Non-chapter note keys | `skipped` |
| Mains placeholder text | `skipped` |

## Importer Modules

| Module | Functions |
|---|---|
| `seeds/importers/content.ts` | `importMcqs`, `importNotes`, `importPyqs`, `importMainsQuestions` |
| `seeds/importers/exam-structure.ts` | `importExamInfoSections`, `importSyllabusNodes` |
| `seeds/importers/static-content.ts` | `importCutoffs`, `importNcertReferences`, `importStrategyMaterials` |
| `seeds/pipeline.ts` | Orchestrates reference → strategy → RTDB importers |

## Out of Scope (Not Mapped)

- Firestore user profiles, quiz results, streaks, bookmarks
- NewsAPI articles
- Firebase Storage binaries (PDFs stored as URLs only in `NcertReference.pdfUrl`)
- OpenAI / LLM prompts
