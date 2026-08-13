-- Step 12: HNSW index for RAG cosine similarity search
CREATE INDEX IF NOT EXISTS rag_embeddings_embedding_hnsw_idx
  ON rag_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
