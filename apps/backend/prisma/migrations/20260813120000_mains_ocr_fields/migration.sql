-- Step 11: Mains OCR pipeline fields
ALTER TABLE "mains_submissions"
  ADD COLUMN IF NOT EXISTS "ocr_retry_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "ocr_error" TEXT;

ALTER TABLE "mains_answers"
  ADD COLUMN IF NOT EXISTS "image_urls" JSONB;
