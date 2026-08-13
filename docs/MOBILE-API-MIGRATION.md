# Mobile API Migration (Step 7)

Screen → API mapping for Firebase decoupling.

| Screen | Previous source | New API |
|--------|-----------------|---------|
| `SyllabusScreen` | RTDB `Syllabus/UPSC_Exam` | `GET /syllabus/UPSC_CSE/tree` |
| `CutOffScreen` | RTDB `cutoffs/{year}` | `GET /cutoffs/UPSC_CSE?year=` |
| `examinfoScreen` | RTDB `Exam info/upsc_cse_2026` | `GET /exam-info/UPSC_CSE` |
| `NcertScreen` | RTDB `ncert_books` | `GET /ncert` |
| `NoteScreen` | RTDB `notes` | `GET /study-materials` |
| `PYQScreen` | RTDB `pyq/2025/questions` | `GET /pyq?year=` |
| `LoginScreen` / `SignupScreen` | Firestore `users` | `POST /auth/login` after Firebase sign-in |
| `ProfileScreen` | Firestore user + stats | `GET /auth/me`, `GET /progress/*` |
| `ExamHomeScreen` | Firestore | `GET /exams`, `GET /exams/:code/subjects` |
| `ChapterScreen` | RTDB notes | `GET /lessons/:id` |

## Mobile foundation

- `apps/mobile/src/services/apiClient.ts` — Axios + Firebase token interceptor
- `apps/mobile/src/context/AuthContext.tsx` — session + backend profile
- `apps/mobile/src/hooks/useContent.ts` — content data hooks
- `apps/mobile/.env.example` — `EXPO_PUBLIC_API_URL` only (no OpenAI/NewsAPI keys)

## Verification

```bash
rg "firebase/firestore|firebase/database" apps/mobile/src/screens/
pnpm --filter @aarambh360/mobile typecheck
```

Quiz screens (`QuizScreen`, `MCQScreen`, `QuizResultScreen`) are migrated in Step 8.
