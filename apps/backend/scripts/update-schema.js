const fs = require('fs');
let schema = fs.readFileSync('apps/backend/prisma/schema.prisma', 'utf8');

const dailyModels = `
// =============================================================================
// DAILY CHALLENGE MODELS
// =============================================================================

enum DailyChallengePaperType {
  PRELIMS_1
  PRELIMS_2
  MAINS
}

model DailyChallenge {
  id               String                  @id @default(uuid()) @db.Uuid
  date             String                  @db.VarChar(10) // YYYY-MM-DD
  paperType        DailyChallengePaperType @map("paper_type")
  timeLimitMinutes Int                     @map("time_limit_minutes")
  totalQuestions   Int                     @map("total_questions")
  isActive         Boolean                 @default(true) @map("is_active")
  createdAt        DateTime                @default(now()) @map("created_at")
  updatedAt        DateTime                @updatedAt @map("updated_at")

  prelimsQuestions DailyChallengeQuestion[]
  mainsQuestion    DailyChallengeMains?
  attempts         DailyChallengeAttempt[]

  @@unique([date, paperType])
  @@index([isActive, date])
  @@map("daily_challenges")
}

model DailyChallengeQuestion {
  id              String   @id @default(uuid()) @db.Uuid
  challengeId     String   @map("challenge_id") @db.Uuid
  questionId      String   @map("question_id") @db.Uuid
  sortOrder       Int      @default(0) @map("sort_order")

  challenge DailyChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  question  Question       @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([challengeId, questionId])
  @@map("daily_challenge_questions")
}

model DailyChallengeMains {
  id              String   @id @default(uuid()) @db.Uuid
  challengeId     String   @unique @map("challenge_id") @db.Uuid
  mainsQuestionId String   @map("mains_question_id") @db.Uuid

  challenge     DailyChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  mainsQuestion MainsQuestion  @relation(fields: [mainsQuestionId], references: [id], onDelete: Cascade)

  @@map("daily_challenge_mains")
}

model DailyChallengeAttempt {
  id                  String                  @id @default(uuid()) @db.Uuid
  challengeId         String                  @map("challenge_id") @db.Uuid
  userId              String                  @map("user_id") @db.Uuid
  paperType           DailyChallengePaperType @map("paper_type")
  score               Decimal                 @db.Decimal(5, 2)
  accuracy            Decimal                 @db.Decimal(5, 2)
  consumedTimeSeconds Int                     @map("consumed_time_seconds")
  completedAt         DateTime                @default(now()) @map("completed_at")
  mainsAnswerText     String?                 @map("mains_answer_text")

  challenge DailyChallenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([challengeId, userId])
  @@index([paperType, score(sort: Desc)])
  @@map("daily_challenge_attempts")
}
`;

schema += dailyModels;

schema = schema.replace('  questionReports   QuestionReport[]', '  questionReports   QuestionReport[]\n  dailyChallenges   DailyChallengeQuestion[]');
schema = schema.replace('  evaluations       MainsEvaluation[]', '  evaluations       MainsEvaluation[]\n  dailyChallenges   DailyChallengeMains[]');
schema = schema.replace('  contentRevisions  ContentRevision[]', '  contentRevisions  ContentRevision[]\n  dailyChallengeAttempts DailyChallengeAttempt[]');

fs.writeFileSync('apps/backend/prisma/schema.prisma', schema);
console.log("Schema updated!");
