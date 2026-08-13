-- Steps 14-15: notifications + analytics tables; preference flags
ALTER TABLE "user_preferences"
  ADD COLUMN IF NOT EXISTS "mains_eval_alerts" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "quiz_reminders" BOOLEAN NOT NULL DEFAULT true;

CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');
CREATE TYPE "NotificationType" AS ENUM ('MAINS_EVAL_COMPLETE', 'STREAK_REMINDER', 'QUIZ_REMINDER', 'GENERAL');
CREATE TYPE "LearningEventType" AS ENUM ('QUIZ_COMPLETED', 'MAINS_SUBMITTED', 'MAINS_EVALUATED', 'LESSON_READ', 'STUDY_SESSION', 'APP_OPEN');

CREATE TABLE "device_tokens" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "token" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");
CREATE INDEX "device_tokens_user_id_is_active_idx" ON "device_tokens"("user_id", "is_active");
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "notification_logs" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "NotificationDeliveryStatus" NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notification_logs_user_id_created_at_idx" ON "notification_logs"("user_id", "created_at" DESC);
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "learning_events" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "event_type" "LearningEventType" NOT NULL,
  "entity_type" TEXT,
  "entity_id" UUID,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "learning_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "learning_events_user_id_event_type_created_at_idx" ON "learning_events"("user_id", "event_type", "created_at" DESC);
CREATE INDEX "learning_events_user_id_created_at_idx" ON "learning_events"("user_id", "created_at" DESC);
ALTER TABLE "learning_events" ADD CONSTRAINT "learning_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
