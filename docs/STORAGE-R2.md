# Cloudflare R2 Storage (Step 10)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/storage/upload-url` | Generate pre-signed upload URL |
| POST | `/storage/confirm` | Confirm upload ownership |

## Request body (`upload-url`)

```json
{
  "purpose": "MAINS_ANSWER | AVATAR | LESSON_ASSET | NCERT_PDF",
  "contentType": "image/jpeg",
  "fileName": "photo.jpg"
}
```

## Key naming

`{purpose}/{userId}/{uuid}.{ext}`

## Limits

- Images: 10 MB (`image/*`)
- NCERT PDFs: 50 MB (`application/pdf`)

## Environment (backend)

```
R2_BUCKET=aarambh360-assets
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_BASE_URL=https://assets.aarambh360.com
```

When R2 is not configured, dev mode returns mock upload URLs (`?dev-upload=1`).

## Mobile

`apps/mobile/src/services/uploadService.ts` — request URL, PUT binary, confirm.

Never embed R2 secret keys in mobile or admin clients.
