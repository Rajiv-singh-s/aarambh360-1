# Quiz & Progress API (Step 8)

## Session lifecycle

1. `POST /quiz/sessions` — `{ topicId, count? }` → creates `QuizAttempt` IN_PROGRESS with random published questions (no correct answers exposed).
2. `POST /quiz/sessions/:id/answers` — records answer, returns `isCorrect`, `correctOptionId`, `explanation`.
3. `POST /quiz/sessions/:id/complete` — finalizes score, updates streak, `DailyActivity`, `TopicProgress`.

## Progress endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/progress/streak` | Required |
| GET | `/progress/stats` | Required |
| GET | `/mistakes` | Required |
| GET | `/leaderboard/:subjectKey` | Required |
| GET/POST/DELETE | `/bookmarks` | Required |

## Scoring rules

- Score = number of correct answers in session.
- Accuracy = `correctCount / totalQuestions * 100`.
- Incorrect answers upsert `Mistake` for revision bank.

## Streak algorithm (IST)

- Activity date normalized to `Asia/Kolkata` calendar day.
- Completing a quiz on consecutive IST days increments `UserStreak` (`MCQ` type).
- Same-day repeat completions do not increment streak again.

## Mobile hooks

- `useQuizEngine` — start/submit/complete session
- `useProgress` — streak, stats, mistakes
