# Mains OCR (Step 11)

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/mains/submissions` | Create submission + enqueue OCR |
| GET | `/mains/submissions/:id` | Poll status and extracted text |
| POST | `/mains/submissions/:id/retry` | Retry failed OCR (max 3) |

## Request body

```json
{
  "mainsQuestionId": "uuid",
  "imageUrl": "https://assets.../mains_answer/{userId}/page.png",
  "imageUrls": ["..."],
  "storageKeys": ["mains_answer/{userId}/page.png"]
}
```

## Status lifecycle

`SUBMITTED` → `EVALUATING` → `EVALUATED` (text ready) or `FAILED`

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Optional server-side vision OCR |
| `R2_PUBLIC_BASE_URL` | Resolve storage keys to URLs |

## Mobile

- `apps/mobile/src/services/mainsService.ts`
- `MainScreen.tsx` uploads via R2, creates submission, polls API
- Client `EXPO_PUBLIC_OPENAI_API_KEY` removed from OCR path

## Error codes

| HTTP | Meaning |
|------|---------|
| 401 | Missing/invalid auth |
| 403 | Image/key not owned by user |
| 404 | Submission or question not found |
| 429 | OCR hourly rate limit exceeded |
