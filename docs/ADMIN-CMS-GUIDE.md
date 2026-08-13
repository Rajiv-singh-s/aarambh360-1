# Admin CMS Guide (Step 9)

## Roles

Backend `@Roles('EDITOR', 'MODERATOR', 'ADMIN')` guard protects `/admin/*` routes.

Normal `USER` role receives `403 Forbidden`.

## Auth flow

1. Sign in via Firebase (mobile app or Firebase console).
2. Copy the Firebase ID token.
3. Paste at `http://localhost:3001/login`.
4. `AdminAuthProvider` verifies `/auth/me` and requires `EDITOR+` role.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/admin/dashboard` | Content counts |
| GET | `/admin/subjects` | List subjects |
| POST | `/admin/subjects` | Create subject (draft) |
| PATCH | `/admin/subjects/:id` | Update subject + revision |
| POST | `/admin/subjects/:id/review` | Move to REVIEW |
| POST | `/admin/subjects/:id/publish` | Publish subject |
| GET | `/admin/topics?subjectId=` | List topics |
| POST | `/admin/topics` | Create topic |
| PATCH | `/admin/topics/:id` | Update topic |
| POST | `/admin/topics/:id/review` | Submit for review |
| POST | `/admin/topics/:id/publish` | Publish topic |
| GET | `/admin/chapters?subjectId=` | List chapters |
| POST | `/admin/chapters` | Create chapter |
| GET | `/admin/lessons?chapterId=` | List lessons |
| POST | `/admin/lessons` | Create lesson |
| PATCH | `/admin/lessons/:id` | Update lesson + revision |
| POST | `/admin/lessons/:id/review` | Submit for review |
| POST | `/admin/lessons/:id/publish` | Publish lesson |
| GET | `/admin/questions/pending` | Questions in REVIEW |
| POST | `/admin/questions` | Create MCQ |
| POST | `/admin/questions/:id/review` | Submit for review |
| POST | `/admin/questions/:id/publish` | Publish question |
| POST | `/admin/mains` | Create mains question |
| PATCH | `/admin/mains/:id` | Update mains question |
| POST | `/admin/mains/:id/review` | Submit for review |
| POST | `/admin/mains/:id/publish` | Publish mains question |
| GET | `/admin/audit-log` | Recent audit entries |

## Admin app pages

| Route | Purpose |
|-------|---------|
| `/login` | Firebase token login with role check |
| `/` | Overview dashboard |
| `/subjects` | Subject stats, create, publish |
| `/topics` | Topic CRUD + publish |
| `/lessons` | Chapter/lesson editor with markdown preview |
| `/questions` | Pending review queue + audit log |
| `/questions/new` | MCQ builder |
| `/mains` | Mains question editor |

Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in admin env.

## Publish workflow

1. Create content with `publishStatus: DRAFT` (default).
2. Submit for review via `POST .../review` → status `REVIEW`.
3. Publish via `POST .../publish` → status `PUBLISHED`.
4. Public mobile/API consumers read published content only.

`AuditLog` entries and `ContentRevision` snapshots are recorded on create, update, and publish.

## Verification

```bash
# Start Postgres + seed
docker compose up -d postgres
pnpm --filter @aarambh360/backend db:migrate:deploy
pnpm --filter @aarambh360/backend db:seed

# Backend tests (includes admin e2e)
pnpm --filter @aarambh360/backend test

# Admin build
pnpm --filter @aarambh360/admin build
```
