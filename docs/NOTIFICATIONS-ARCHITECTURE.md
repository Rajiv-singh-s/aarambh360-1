# Notifications Architecture (Step 14)

## Overview

Firebase Cloud Messaging push notifications with server-side token management and preference controls.

## Components

- `NotificationsModule` — token registration, preferences, delivery logs
- `NotificationsService` — FCM via Firebase Admin (dev log mode when Admin unavailable)
- Trigger: Mains evaluation completion (from `EvaluationService`)

## APIs

| Method | Path | Description |
|--------|------|-------------|
| POST | `/notifications/register-token` | Register FCM device token |
| DELETE | `/notifications/register-token` | Deactivate token on logout |
| GET/PATCH | `/notifications/preferences` | Read/update notification preferences |
| GET | `/notifications/history` | Recent delivery logs |

## Database

- `device_tokens` — user-owned push tokens
- `notification_logs` — delivery audit trail
- `user_preferences.mains_eval_alerts`, `quiz_reminders`

## Security

- Authenticated endpoints; tokens scoped to current user
- Cross-user token reassignment deactivates old ownership
- No FCM secrets in mobile binary

## Limitations

- Streak/quiz reminder cron jobs deferred (manual trigger architecture ready)
- No in-app notification center yet
