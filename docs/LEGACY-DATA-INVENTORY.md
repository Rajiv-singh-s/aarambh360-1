# Legacy Data Inventory — Step 5

Generated: 2026-08-12  
Scope: Audit of `legacy-Aarambh360/` and Firebase project `aarambh360-97dfe`

## Executive Summary

| Classification | Finding |
|---|---|
| **Primary content store** | Firebase Realtime Database (RTDB) — all curriculum content |
| **User data store** | Firestore (`users/{uid}/…`) — **out of Step 5 scope** |
| **Hardcoded content** | 6 UPSC strategy sections in `StrategyScreen.tsx` |
| **In-repo JSON exports** | **None** — must be extracted at seed time |
| **RTDB access** | Requires Firebase Admin service account or authenticated user (anonymous auth disabled) |

## Firebase Configuration

| Setting | Value |
|---|---|
| Project ID | `aarambh360-97dfe` |
| RTDB URL | `https://aarambh360-97dfe-default-rtdb.firebaseio.com` |
| Config source | `legacy-Aarambh360/src/firebaseConfig.ts` |

## RTDB Source Inventory

| RTDB Path | Content Type | Legacy Consumer | Target Prisma Models | Est. Count |
|---|---|---|---|---|
| `/{subjectKey}/classwise/{classKey}/questions` | MCQ quizzes | `MCQScreen.tsx`, `QuizScreen.tsx` | `Exam`, `Subject`, `Topic`, `Question`, `QuestionOption` | Unknown (dynamic) |
| `notes/{subject}/{chapter}` | Chapter notes + embedded MCQs | `NoteScreen.tsx`, `ChapterScreen.tsx` | `Subject`, `Chapter`, `Lesson`, `LessonSection`, `Question` | Unknown |
| `ncert_books/{class}/{subject}` | NCERT PDF URLs | `NcertScreen.tsx` | `NcertReference` | Unknown |
| `Syllabus/UPSC_Exam` | Syllabus tree | `SyllabusScreen.tsx` | `SyllabusNode` | 1 root tree |
| `Exam info/upsc_cse_2026` | Exam metadata | `examinfoScreen.tsx` | `ExamInfoSection` | 1 exam node |
| `cutoffs/{year}` | Cutoff tables | `CutOffScreen.tsx` | `CutOffRecord` | ~11 years (2015–2025 UI) |
| `pyq/{year}/questions` | PYQ list | `pyqScreen.tsx` (2025 only) | `Question`, `PyqMetadata` | Unknown |
| `mains/{year}/{month}/{day}` | Daily mains Q | `mainsDB.ts` | `MainsQuestion` | Unknown |

**Reserved root keys** (excluded from MCQ subject scan): `notes`, `ncert_books`, `Syllabus`, `Exam info`, `cutoffs`, `pyq`, `mains`.

## Hardcoded / Non-RTDB Sources

| Source | Location | Classification | Target Model | Count |
|---|---|---|---|---|
| UPSC strategy sections | `legacy-Aarambh360/src/screens/StrategyScreen.tsx` | Hardcoded application content | `StudyMaterial` | 6 |
| Daily tips | `ExamHomeScreen.tsx`, `MainHomeScreen.tsx` | Hardcoded UI copy | Not seeded (UI-only) | 5 |
| News articles | `NewsScreen.tsx` | External API (NewsAPI) | Not seeded | N/A |
| OpenAI evaluation prompt | `mainsEvaluate.ts` | Configuration | Not seeded | N/A |

## Firestore (Out of Scope)

| Collection / Path | Purpose | Step 5 Action |
|---|---|---|
| `users/{uid}` | User profiles | **Do not migrate** |
| `users/{uid}/quizResults` | Quiz history | **Do not migrate** |
| `users/{uid}/mcqStreaks` | Streak data | **Do not migrate** |
| `users/{uid}/bookmarks` | Bookmarks | **Do not migrate** |
| `leaderboard/{subjectKey}/entries` | Leaderboard | **Do not migrate** |

## Data Quality Observations

| Issue | Impact | Handling |
|---|---|---|
| MCQ `options` as array **or** record | Parser must normalize both | `normalizeOptions()` in seed utils |
| MCQ `answer` as letter or full text | Correct option resolution | `resolveCorrectOptionLabel()` |
| Notes chapter keys must contain `"chapter"` | Non-chapter keys skipped | Importer filter + `skipped` counter |
| PYQ app hardcodes year `2025` | Other years may exist in RTDB | Importer walks all `pyq/{year}` nodes |
| Duplicate question text within topic | Duplicate MCQs | SHA-256 hash dedupe within import run |
| RTDB REST returns 401 without auth | Blocks unauthenticated export | Use `extract:rtdb` with Admin credentials |

## Extraction Status

| Item | Status |
|---|---|
| `legacy-data/rtdb-export.json` | **Present** (~1.8 MB, extracted 2026-08-12) |
| Extraction script | `apps/backend/scripts/extract-rtdb.ts` |
| RTDB top-level keys | `0`, `1`, `Exam info`, `Syllabus`, `cutoffs`, `mains`, `notes`, `pyq` |
| `ncert_books` | **Absent** from live RTDB snapshot |

## Discovered Record Counts (RTDB export audit)

| Domain | Approx. Count |
|---|---:|
| MCQs (classwise + embedded in notes) | 2,307 |
| Notes chapters | 1 |
| PYQ questions | 20 |
| Mains questions | 4 |
| Cutoff records | 55 |
| Syllabus nodes | 67 |
| Exam info sections | 32 |
| NCERT references | 0 |

## Extraction Commands

```bash
# 1. Configure apps/backend/.env with FIREBASE_SERVICE_ACCOUNT (JSON one-liner)
# 2. Extract RTDB snapshot
pnpm --filter @aarambh360/backend extract:rtdb

# 3. Seed PostgreSQL (idempotent)
pnpm --filter @aarambh360/backend db:seed

# 4. Validate row counts
pnpm --filter @aarambh360/backend validate:seed
```

Alternative: export JSON manually from Firebase Console → Realtime Database → ⋮ → Export JSON → save as `legacy-data/rtdb-export.json`.
