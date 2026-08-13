# Aarambh360 Content API

**Step 6** — read-only REST endpoints for curriculum discovery. All content is served from PostgreSQL via Prisma. Only `PUBLISHED` rows are returned.

**Base URL:** `http://localhost:4000`  
**Swagger:** `http://localhost:4000/api/docs`

## Authentication

| Scope | Requirement |
|---|---|
| Most content endpoints | **Public** (`@Public()`) |
| `GET /subjects/:id/topics` | **Bearer token required** (Firebase ID token) |

```http
Authorization: Bearer <firebase_id_token>
```

## Response contracts

**Single resource:**

```json
{ "data": { ... } }
```

**Paginated list:**

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 2327,
    "totalPages": 117,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Pagination query params:** `page` (default 1), `limit` (default 20, max 100)

## Endpoints

### Exams

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/exams` | Public | List active exams |
| `GET` | `/exams/:code` | Public | Exam detail + stages (`UPSC_CSE`) |
| `GET` | `/exams/:code/subjects` | Public | Published subjects for exam |

### Learn

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/subjects/:id/topics` | **Protected** | Topics with optional user progress |
| `GET` | `/topics/:id` | Public | Topic detail |
| `GET` | `/topics/:id/lessons` | Public | Paginated lessons |
| `GET` | `/lessons/:id` | Public | Lesson + ordered sections |

### Syllabus

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/syllabus/:examCode/tree` | Public | Nested syllabus tree (cached 5 min) |

### Exam info & cutoffs

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/exam-info/:examCode` | Public | Exam information sections |
| `GET` | `/cutoffs/:examCode` | Public | Paginated cutoff records (`?year=2022`) |

### Questions (MCQ)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/questions` | Public | Paginated MCQs (no correct answers) |
| `GET` | `/questions/:id` | Public | Question detail (options without `isCorrect`) |

**Filters:** `examId`, `subjectId`, `topicId`, `difficulty`, `type`, `year`

### PYQ

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/pyq` | Public | Paginated PYQs |
| `GET` | `/pyq/:id` | Public | PYQ detail |

**Filters:** `year`, `paper` (GS1–GS4, CSAT, etc.)

### NCERT

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/ncert` | Public | Paginated NCERT PDF references |

**Filters:** `classNumber`, `subjectName`  
**Note:** Live RTDB export contained no `ncert_books` — list may be empty until data is added.

### Study materials

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/study-materials` | Public | Paginated materials (strategy sections, etc.) |
| `GET` | `/study-materials/:id` | Public | Material detail with content body |

**Filters:** `materialType` (e.g. `strategy`)

### Mains questions (read-only)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/mains` | Public | Paginated Mains questions |
| `GET` | `/mains/:id` | Public | Mains question detail |

**Filters:** `paper`, `year`  
**Out of scope:** answer submission, AI evaluation (Step 13)

## Example requests

```bash
curl http://localhost:4000/exams
curl http://localhost:4000/syllabus/UPSC_CSE/tree
curl "http://localhost:4000/questions?page=1&limit=10&difficulty=MEDIUM"
curl http://localhost:4000/pyq?year=2025
curl http://localhost:4000/cutoffs/UPSC_CSE?year=2022
curl http://localhost:4000/study-materials?materialType=strategy
```

## Errors

Uses standard `ApiErrorResponse`:

| Status | When |
|---|---|
| `400` | Invalid query params / enum values |
| `401` | Missing/invalid token on protected routes |
| `404` | Exam, question, lesson, or other entity not found |
| `429` | Rate limit exceeded (100 req/min default) |
| `500` | Unexpected server error (no Prisma internals exposed) |

## Security notes

- MCQ list/detail endpoints **never expose** `isCorrect` on options (quiz scoring is Step 8).
- Unpublished (`DRAFT`/`ARCHIVED`) and soft-deleted content is excluded.
- Syllabus tree is cached in-memory for 5 minutes to reduce DB load.

## Known data limitations (from Step 5)

1. **NCERT references:** zero rows — `ncert_books` absent from RTDB export.
2. **Subject codes:** legacy numeric keys (`0` = Social Science) preserved as slugified codes.

## Modules

| NestJS module | Path |
|---|---|
| `ExamModule` | `apps/backend/src/exam/` |
| `LearnModule` | `apps/backend/src/learn/` |
| `SyllabusModule` | `apps/backend/src/syllabus/` |
| `ContentModule` | `apps/backend/src/content/` |

Shared DTOs: `packages/types/src/content.ts`
