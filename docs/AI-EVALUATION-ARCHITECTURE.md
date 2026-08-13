# AI Evaluation Architecture (Step 13)

## Overview

```
Mobile → POST /evaluate
           ↓
EvaluationService
  ├─ Load submission + question + OCR text
  ├─ RagService.search (top-5, gsPaper/subject filters)
  ├─ Prompt builder (upsc-rubric v1)
  ├─ AIProvider (dev | gemini | openai)
  ├─ JSON validator
  └─ Persist MainsEvaluation
```

## Components

| Module | Path | Role |
|--------|------|------|
| AI abstraction | `apps/backend/src/mains/ai/` | Provider interface, Gemini/OpenAI/dev implementations |
| Evaluation | `apps/backend/src/mains/evaluation/` | Orchestration, validation, persistence |
| Rubric prompts | `evaluation/prompts/upsc-rubric.ts` | System/user prompt templates, versioning |
| RAG | `apps/backend/src/rag/rag.service.ts` | Existing Step 12 retrieval (not duplicated) |

## Lifecycle

- OCR complete: `MainsSubmission.status = EVALUATED` (unchanged from Step 11)
- Evaluation in progress: in-process async job + `processing` lock (same pattern as OCR)
- Evaluation complete: `MainsEvaluation` row created; `evalError` cleared
- Evaluation failure: `evalError` set; submission/OCR preserved; retry via `force: true`

## Cost controls

- Top-5 RAG chunks, truncated chunk/answer text
- Max 4096 output tokens
- 60s provider timeout
- Idempotent evaluate (returns existing unless `force`)
- 10 evaluations/user/hour hard limit (Step 15 will add entitlements)

## Database

Migration `20260813130000_mains_evaluation_fields`:

- `mains_submissions.eval_retry_count`
- `mains_submissions.eval_error`

Reuses existing `mains_evaluations` table from init schema.

## Testing

- Unit: `evaluation.service.spec.ts`, `evaluation.validator.spec.ts`
- E2E: `test/evaluation.e2e-spec.ts` (OCR → evaluate → rubric)

## Limitations

- No push notification on completion (Step 14)
- No subscription quota enforcement (Step 15)
- No human evaluator override
- Quality review on 20+ samples recommended before production quotas
