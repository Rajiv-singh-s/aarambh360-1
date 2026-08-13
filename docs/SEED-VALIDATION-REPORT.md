# Seed Validation Report

Generated: 2026-08-12 (post RTDB import)

## Import summary (first seed run)

| Domain | Discovered | Imported | Rejected | Duplicate |
|---|---:|---:|---:|---:|
| cutoffs | 55 | 55 | 0 | 0 |
| ncert | 0 | 0 | 0 | 0 |
| examInfo | 32 | 32 | 0 | 0 |
| syllabus | 67 | 67 | 0 | 0 |
| mcqs | 2,257 | 2,257 | 0 | 0 |
| notes | 51 | 51 | 0 | 0 |
| pyq | 20 | 20 | 0 | 0 |
| mains | 4 | 4 | 0 | 0 |
| strategy (hardcoded) | 6 | 6 | 0 | 0 |
| **Total** | **2,492** | **2,486** | **0** | **0** |

**Idempotency:** second seed run updated existing rows without increasing question count.

## PostgreSQL row counts

| Entity | Count |
|---|---:|
| exams | 1 |
| exam_stages | 3 |
| tags | 6 |
| subjects | 2 |
| topics | 6 |
| chapters | 1 |
| lessons | 1 |
| lesson_sections | 1 |
| questions | 2,327 |
| question_options | 9,228 |
| pyq_metadata | 20 |
| mains_questions | 4 |
| ncert_references | 0 |
| cutoff_records | 55 |
| syllabus_nodes | 67 |
| exam_info_sections | 33 |
| study_materials | 6 |

## Integrity checks

| Check | Result |
|---|---|
| MCQ questions without topic mapping | 0 |
| RTDB export present | yes |

## Warnings

- `ncert_books` node missing from RTDB export — zero NCERT references imported.
- MCQ subjects stored under numeric RTDB keys (`0` = Social Science); mapped to canonical `Subject` rows.

## Notes

- Re-run `pnpm --filter @aarambh360/backend extract:rtdb` before seeding if legacy Firebase content changed.
- Re-run `pnpm --filter @aarambh360/backend db:seed` to apply idempotent imports.
- Service account JSON must **not** be committed; use `FIREBASE_SERVICE_ACCOUNT_PATH` in local `.env`.
