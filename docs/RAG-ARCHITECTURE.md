# RAG Architecture (Step 12)

## Pipeline

```text
Published content (lessons, model answers, syllabus)
  → IngestionService
  → ChunkingService (2000 chars, 200 overlap)
  → EmbeddingProvider (hash dev default | OpenAI when configured)
  → rag_documents / rag_chunks / rag_embeddings (pgvector)
  → RagService.search(query, filters)
```

## Models (Step 3 canonical)

- `RagDocument` — source identity + metadata
- `RagChunk` — ordered text segments
- `RagEmbedding` — `vector(1536)` with HNSW index

## Embedding provider

| Provider | Model id | When |
|----------|----------|------|
| Hash (dev) | `hash-embedding-v1` | Default |
| OpenAI | `text-embedding-3-small` | `OPENAI_API_KEY` set |

## API (EDITOR+)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/rag/ingest` | Full re-index of published content |
| POST | `/rag/search` | Semantic retrieval with metadata filters |
| GET | `/rag/stats` | Index counts |

## CLI

```bash
pnpm --filter @aarambh360/backend rag:ingest
```

## Retrieval filters

- `gsPaper`
- `subjectId`
- `documentType`

Only `isActive` documents are searched. Unpublished source content is excluded at ingestion.

See also: `docs/RAG-PIPELINE.md`
