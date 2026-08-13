# RAG Pipeline (Step 12)

## Ingestion

Indexes **published** content only:

- NCERT lessons (`PublishStatus.PUBLISHED`)
- Mains model answers
- Syllabus node descriptions

Idempotent by `(documentType, sourceRef)` — re-run replaces chunks/embeddings.

## Chunking

- Size: ~2000 characters
- Overlap: 200 characters
- Token estimate: words × 1.3

## Vector storage

- Dimension: **1536** (canonical schema)
- Index: HNSW cosine (`rag_embeddings_embedding_hnsw_idx`)
- Extension: `vector` (enabled in init migration)

## Search API

```http
POST /rag/search
Authorization: Bearer <editor-token>
Content-Type: application/json

{
  "query": "Fundamental Rights Article 14",
  "topK": 5,
  "gsPaper": "GS2",
  "subjectId": "uuid",
  "documentType": "NCERT"
}
```

Response items include `chunkId`, `title`, `content`, `score`, `metadata`, `sourceRef` — not raw vectors.

## Commands

```bash
docker compose up -d postgres
pnpm --filter @aarambh360/backend db:migrate:deploy
pnpm --filter @aarambh360/backend rag:ingest
```

## Environment

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | Optional real embeddings (`text-embedding-3-small`) |

Without API key, deterministic hash embeddings are used for dev/test.
