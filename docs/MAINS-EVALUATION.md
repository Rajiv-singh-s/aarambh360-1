# Mains AI Evaluation

Step 13 adds server-side, RAG-grounded AI evaluation for UPSC Mains answers.

## Flow

1. User uploads answer images → OCR (Step 11) → `MainsAnswer.extractedText`
2. User edits/confirms text in mobile editor
3. `POST /mains/submissions/:id/evaluate` enqueues evaluation
4. Backend retrieves top-5 RAG chunks, assembles rubric prompt, calls AI provider
5. Structured JSON is validated and persisted to `MainsEvaluation`
6. Mobile polls `GET /mains/submissions/:id` until `evaluation` is present

## Rubric schema

Persisted in `MainsEvaluation.feedbackJson`:

```json
{
  "totalMarks": 6.2,
  "maxMarks": 10,
  "relevanceScore": 72,
  "dimensions": [
    { "name": "Introduction", "score": 1, "maxScore": 2, "feedback": "..." }
  ],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingPoints": ["..."],
  "suggestions": ["..."],
  "conclusion": "...",
  "sources": [{ "chunkId": "...", "title": "...", "documentType": "...", "score": 0.82 }]
}
```

Rubric version: `upsc-v1` (stored in `evaluationMeta.rubricVersion`).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/mains/submissions` | List user submissions with evaluation summary |
| POST | `/mains/submissions/:id/evaluate` | Trigger evaluation (`answerText?`, `force?`) |
| GET | `/mains/submissions/:id/evaluation` | Fetch structured evaluation |
| GET | `/mains/submissions/:id` | Submission + OCR text + evaluation if ready |

## Environment

```env
AI_PROVIDER=dev          # default stub for local dev
AI_PROVIDER=gemini       # requires GEMINI_API_KEY
AI_PROVIDER=openai       # requires OPENAI_API_KEY
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

## Security

- Firebase auth + ownership on all endpoints
- User answer wrapped in `USER_ANSWER_BEGIN/END`; system prompt treats it as untrusted content
- Malformed AI JSON retried up to 2 times; failures stored in `evalError`
- Rate limit: 10 evaluations per user per hour

## Sample dev-stub output

Dev provider returns deterministic JSON (~62% of max marks) without external API calls.
