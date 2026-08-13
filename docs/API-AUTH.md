# Aarambh360 API Authentication

**Step 4 foundation** — Firebase ID token verification, PostgreSQL user provisioning, and protected-route guards.

## Overview

```plaintext
Mobile App
   │
   ├─► Firebase Auth (Email / Phone OTP / Google) ──► Firebase ID Token (JWT)
   │
   └─► NestJS API with Authorization: Bearer <token>
           │
           ├─► firebase-admin.verifyIdToken()
           ├─► PostgreSQL User upsert / lookup by firebase_uid
           └─► req.user context for protected routes
```

Firebase Authentication remains on the **mobile client**. The backend never stores passwords. It verifies Firebase ID tokens server-side and owns the canonical `users` row in PostgreSQL.

## Configuration

Set one of the following in `apps/backend/.env` (never commit real credentials):

| Variable | Description |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Full Firebase service account JSON (single line) |
| `FIREBASE_PROJECT_ID` | Firebase project ID (`aarambh360-97dfe`) |
| `FIREBASE_CLIENT_EMAIL` | Service account client email |
| `FIREBASE_PRIVATE_KEY` | Service account private key (`\n` escaped) |
| `DATABASE_URL` | PostgreSQL connection string |

See `apps/backend/.env.example`.

## Authentication header

All authenticated requests:

```http
Authorization: Bearer <firebase_id_token>
```

Missing or invalid tokens return **401 Unauthorized**.

## Endpoints

### Public routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API metadata |
| `GET` | `/health` | Liveness + database/firebase status |
| `GET` | `/health/ready` | Readiness checks |
| `POST` | `/auth/login` | Verify token + upsert PostgreSQL user |

### Protected routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/auth/me` | Current user, profile, preferences, entitlements stub |
| `PATCH` | `/users/me` | Update profile fields |
| `DELETE` | `/users/me` | Soft-delete account + Firebase Auth deletion |

## Request / response contracts

### `POST /auth/login`

Verifies the Firebase token and creates or updates the PostgreSQL user record.

**Headers**

```http
Authorization: Bearer <firebase_id_token>
```

**Response `200`**

Uses `LoginResponseDto` from `@aarambh360/types`:

```json
{
  "user": {
    "id": "uuid",
    "firebaseUid": "firebase-uid",
    "email": "aspirant@example.com",
    "phone": null,
    "role": "USER",
    "profileCompleted": false,
    "createdAt": "2026-08-12T12:00:00.000Z",
    "updatedAt": "2026-08-12T12:00:00.000Z"
  },
  "profile": { "name": "Aspirant", "...": "..." },
  "preferences": { "theme": "system", "...": "..." },
  "onboarding": { "currentStep": 0, "completed": false, "completedAt": null },
  "entitlements": []
}
```

**Notes**

- Must be called at least once after sign-in so PostgreSQL identity records exist.
- Deleted accounts receive **401** and cannot re-authenticate.
- Rate limit: **10 requests / minute**.

### `GET /auth/me`

Returns the same shape as login for the authenticated user.

**Requires:** valid Bearer token + existing PostgreSQL user (call `/auth/login` first).

### `PATCH /users/me`

Partial profile update.

**Body (all optional)**

```json
{
  "name": "Rajiv Singh",
  "dateOfBirth": "1998-01-15",
  "gender": "Male",
  "targetYear": 2027,
  "preparationLevel": "INTERMEDIATE",
  "dailyStudyMinutes": 120,
  "profileCompleted": true
}
```

### `DELETE /users/me`

Soft-deletes the PostgreSQL user (`deletedAt` set) and attempts Firebase Auth account deletion.

**Response `200`**

```json
{
  "message": "Account deleted successfully",
  "deletedAt": "2026-08-12T12:00:00.000Z"
}
```

Rate limit: **3 requests / minute**.

## Error format

All errors use `ApiErrorResponse` from `@aarambh360/types`:

```json
{
  "statusCode": 401,
  "message": "Invalid or expired authentication token",
  "error": "Unauthorized",
  "timestamp": "2026-08-12T12:00:00.000Z",
  "path": "/auth/me"
}
```

| Status | Meaning |
|---|---|
| `401` | Missing/invalid token, deleted account, auth service unavailable |
| `404` | Profile not found |
| `429` | Rate limit exceeded |
| `400` | Validation error (invalid profile payload) |

## User lifecycle

1. **Sign up / sign in** on mobile via Firebase Auth.
2. **Obtain ID token** from Firebase client SDK.
3. **`POST /auth/login`** — backend upserts `users`, `profiles`, `user_preferences`, `onboarding_progress`.
4. **Use protected APIs** with the same Bearer token.
5. **`PATCH /users/me`** — update aspirant profile.
6. **`DELETE /users/me`** — soft-delete + Firebase Auth removal (App Store / Play compliance).

## Password reset

Password reset remains **client-side** via Firebase `sendPasswordResetEmail()`. No backend endpoint is required.

Phone OTP and Google Sign-In are enabled in Firebase Console; mobile wiring is planned for Step 7.

## Authorization foundation

- `@Public()` marks routes that skip authentication (`/health`, `/auth/login`).
- `@CurrentUser()` injects `AuthUserContext` into controllers.
- Global `FirebaseAuthGuard` protects all other routes.
- `UserRole` enum (`USER`, `EDITOR`, `MODERATOR`, `ADMIN`) is stored on `users.role` for future RBAC (Admin CMS in Step 9).

## Security controls (Step 4)

- Server-side Firebase token verification (`verifyIdToken` with revocation check)
- No secrets in mobile bundle for backend auth
- Global validation pipe (`whitelist`, `forbidNonWhitelisted`)
- Global exception filter (no stack traces leaked to clients)
- `@nestjs/throttler` on auth-sensitive routes
- CORS configurable via `CORS_ORIGIN`
- Soft-deleted users blocked from login and protected routes

## Verification commands

```bash
# Login (requires real Firebase ID token)
curl -X POST http://localhost:4000/auth/login \
  -H "Authorization: Bearer <firebase_id_token>"

# Current user
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer <firebase_id_token>"

# Update profile
curl -X PATCH http://localhost:4000/users/me \
  -H "Authorization: Bearer <firebase_id_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Rajiv Singh","targetYear":2027}'

# Delete account
curl -X DELETE http://localhost:4000/users/me \
  -H "Authorization: Bearer <firebase_id_token>"
```

## Related documentation

- `docs/FIREBASE-AUDIT.md` — legacy Firebase usage
- `docs/STEP-3-FIREBASE-MAPPING.md` — Firestore `users/{uid}` → PostgreSQL mapping
- `docs/AARAMBH360-ROADMAP.md` — Step 4 definition of done
