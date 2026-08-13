# Mains OCR Architecture (Step 11)

## Flow

```text
Mobile (image picker)
  → uploadService (R2 pre-signed PUT)
  → POST /mains/submissions { mainsQuestionId, imageUrls | storageKeys }
  → MainsSubmission (SUBMITTED)
  → in-process OCR worker (OcrService.enqueue)
  → OcrProvider.extractText per page
  → MainsAnswer.extractedText
  → MainsSubmission (EVALUATED | FAILED)
  → GET /mains/submissions/:id (poll)
```

## OCR provider abstraction

| Provider | When used |
|----------|-----------|
| `dev-stub` | Default local/dev (no API key) |
| `openai-gpt-4o-mini` | When `OPENAI_API_KEY` is set server-side |

Mobile never calls OCR providers directly.

## Security

- Submission URLs/keys must include `mains_answer/{userId}/` prefix
- Cross-user keys return `403 Forbidden`
- OCR rate limit: 10 submissions/hour/user
- Max OCR retries: 3 (`ocrRetryCount`, status `FAILED`)

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/mains/submissions` | User |
| GET | `/mains/submissions/:id` | Owner |
| POST | `/mains/submissions/:id/retry` | Owner (FAILED only) |

## Database

- `mains_submissions.ocr_retry_count`
- `mains_submissions.ocr_error`
- `mains_answers.image_urls` (JSON array for multi-page)

See also: `docs/MAINS-OCR.md`
