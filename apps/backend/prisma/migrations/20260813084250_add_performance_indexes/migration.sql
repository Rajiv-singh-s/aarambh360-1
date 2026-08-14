-- DropIndex
DROP INDEX IF EXISTS "rag_embeddings_embedding_hnsw_idx";

-- CreateIndex
CREATE INDEX "mains_submissions_user_id_status_idx" ON "mains_submissions"("user_id", "status");

-- CreateIndex
CREATE INDEX "quiz_attempts_user_id_status_idx" ON "quiz_attempts"("user_id", "status");

-- CreateIndex
CREATE INDEX "usage_records_user_id_feature_id_created_at_idx" ON "usage_records"("user_id", "feature_id", "created_at");
