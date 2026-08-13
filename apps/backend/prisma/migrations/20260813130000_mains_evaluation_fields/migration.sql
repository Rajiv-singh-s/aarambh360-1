-- Step 13: Mains AI evaluation retry/error tracking
ALTER TABLE "mains_submissions"
  ADD COLUMN IF NOT EXISTS "eval_retry_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "eval_error" TEXT;
