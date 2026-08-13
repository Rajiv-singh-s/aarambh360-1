# Analytics & Personalization (Step 15)

## Overview

Learning event tracking plus analytics profile derived from existing Progress data and Mains activity.

## Components

- `AnalyticsModule` — event ingestion, profile, recommendations
- Reuses `ProgressService.getStats()` (no duplicate progress logic)

## APIs

| Method | Path | Description |
|--------|------|-------------|
| POST | `/analytics/events` | Track learning event |
| GET | `/analytics/me/profile` | Stats, weak/strong areas |
| GET | `/analytics/me/recommendations` | Personalized next steps |
| GET | `/analytics/me/events` | Recent events |

## Event types

`QUIZ_COMPLETED`, `MAINS_SUBMITTED`, `MAINS_EVALUATED`, `LESSON_READ`, `STUDY_SESSION`, `APP_OPEN`

## Database

- `learning_events` — append-only activity log

## Privacy

- Stores user ID + event metadata only; no passwords/tokens
- User-isolated queries on all endpoints

## Limitations

- No Sentry/Datadog (roadmap observability deferred)
- Recommendations are rule-based MVP, not ML
