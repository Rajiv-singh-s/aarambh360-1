# Production Readiness Audit & Risk Assessment: Aarambh360

## 1. Executive Assessment

The current codebase is a **prototype / proof-of-concept** and is **NOT production-ready**. 

While the visual layer demonstrates strong UI craftsmanship, the application possesses critical security vulnerabilities, unmitigated financial exposure risks, missing core architectural components (backend, database, CMS), and zero test coverage.

---

## 2. Comprehensive Production Readiness Matrix

| Category | Finding / Issue | Severity | Current Situation | Recommended Solution | Production Blocker? |
|---|---|---|---|---|---|
| **SECURITY** | Exposed OpenAI API Key on Client | **CRITICAL** | `mainsEvaluate.ts` and `mainsOCR.ts` read `EXPO_PUBLIC_OPENAI_API_KEY` and call OpenAI directly from the mobile device. | Move all OCR and LLM evaluation logic to NestJS backend. Remove client keys immediately. | **YES** |
| **SECURITY** | Exposed NewsAPI Key | **CRITICAL** | `NewsScreen.tsx` hardcodes active NewsAPI secret key (`4044ce8f82934ef4b96ac2ccc0b9869f`). | Proxy all current affairs and news through NestJS backend; revoke exposed key. | **YES** |
| **SECURITY** | Unvalidated Client-Side Database Writes | **CRITICAL** | Client writes marks, accuracy, streaks, reports, and leaderboard scores directly to Firestore. | All scoring, streak calculations, and submissions must be verified and written exclusively by NestJS. | **YES** |
| **SECURITY** | No API Rate Limiting or Anti-Abuse | **HIGH** | No rate limiting on auth, evaluation, or content endpoints. | Implement `@nestjs/throttler` guards on backend routes. | **YES** |
| **AUTHENTICATION** | Incomplete Auth & Missing Recovery | **HIGH** | Email/password only; "Forgot Password" triggers an Alert with *"Coming Soon"*; no Phone OTP or Google Sign-In. | Implement Firebase Auth Phone OTP + Google Sign-In; wire password reset email flow. | **YES** |
| **AUTHENTICATION** | Missing Account Deletion Flow | **HIGH** | No option in Profile or Settings to delete account. Required by Apple App Store & Google Play Store policies. | Implement `DELETE /users/me` endpoint in backend that purges user data and deletes Firebase Auth record. | **YES** |
| **DATA MANAGEMENT** | No Relational Database or Backups | **CRITICAL** | App runs on unstructured Firestore/RTDB JSON trees without schema migrations or relational constraints. | Deploy PostgreSQL + Prisma with automated migrations and backups. | **YES** |
| **PERFORMANCE** | Memory Bloat from Base64 Image Processing | **HIGH** | Images are converted to full base64 strings in React Native JS thread for OCR, causing UI thread freezing. | Upload binary image streams directly to Cloudflare R2 using pre-signed URLs. | **YES** |
| **PERFORMANCE** | Full Dataset Ingestion on Component Mount | **MEDIUM** | `MCQScreen.tsx` fetches the entire RTDB root (`snap = await get(ref(realtimeDB, "/"))`) to list subjects. | Implement paginated, indexed REST endpoints on NestJS backend. | **NO** |
| **MAINTAINABILITY** | Orphaned Files & 0-Byte Stubs | **HIGH** | 22 duplicate `.tsx` files in root directory; 4 empty 0-byte files; `types.ts` is empty. | Purge root duplicate files; consolidate TypeScript definitions into shared DTOs/types. | **YES** |
| **MAINTAINABILITY** | Monolithic Screen Files | **MEDIUM** | `QuizScreen.tsx` is 1278 lines long with mixed UI, business logic, sound, timers, and DB mutations. | Refactor into modular subcomponents and custom hooks (`useQuizEngine`, `useTimer`). | **NO** |
| **TESTING** | Zero Automated Test Coverage | **CRITICAL** | 0 unit tests, 0 component tests, 0 E2E tests, no Jest runner configured. | Configure Jest + `@testing-library/react-native` for mobile; Jest for NestJS services. | **YES** |
| **OBSERVABILITY** | No Crash Reporting or APM | **HIGH** | Errors are caught with `console.warn` or empty catch blocks. No telemetry in production builds. | Integrate Sentry or Firebase Crashlytics on mobile; Winston logger + Sentry on backend. | **YES** |
| **DEPLOYMENT** | No Automated CI/CD Pipeline | **HIGH** | No GitHub Actions workflow to run linting, type checks, unit tests, or automated EAS builds. | Build GitHub Actions workflows for mobile CI (test + EAS build) and backend CD (deploy to Render/Railway). | **YES** |
| **PRIVACY & COMPLIANCE**| Missing Privacy Policy & Legal Disclaimers | **HIGH** | App lacks in-app Privacy Policy, Terms of Service, and content attribution links. | Create in-app web views for Legal/Privacy documents and attribution notices. | **YES** |
| **ERROR HANDLING** | Silent Failures & Missing Fallbacks | **MEDIUM** | `catch` blocks return fallback empty arrays or generic alerts without retry mechanisms. | Implement structured error boundaries, toast notifications, and retry buttons for failed network calls. | **NO** |
| **ACCESSIBILITY** | Missing Accessibility Labels & Touch Target Checks | **LOW** | Icon-only buttons lack `accessibilityLabel` attributes; touch target sizes vary. | Audit and apply accessibility props across all interactive elements. | **NO** |

---

## 3. Production Gate Checklist (Prior to v1.0 Launch)

### Security & Infrastructure
- [ ] No API secrets or LLM keys bundled in mobile client binary.
- [ ] Firebase ID Tokens verified server-side on every protected API call.
- [ ] PostgreSQL database running with encrypted storage and daily backups.
- [ ] Cloudflare R2 configured with strict CORS and short-lived upload URLs.
- [ ] Rate limiting enabled on NestJS API (especially `/mains/evaluate`).

### Feature & Logic Verification
- [ ] Complete UPSC Onboarding flow (Target Year, Preparation Stage, Daily Study Goal).
- [ ] MCQ practice engine submits answers to backend and receives server-calculated score.
- [ ] Mistakes auto-log to user's Mistakes revision bank upon incorrect attempt.
- [ ] Mains OCR + RAG evaluation pipeline functional and returning structured rubric feedback.
- [ ] Razorpay subscription payment flow and entitlement enforcement functional.

### Quality Assurance & Compliance
- [ ] Test coverage $\ge 80\%$ on backend business logic (scoring, entitlements, auth guards).
- [ ] Sentry / Crashlytics error monitoring active and receiving test events.
- [ ] Account Deletion button functional and verified against Apple App Store guideline 5.1.1.
- [ ] Privacy Policy and Terms of Service linked in-app.
- [ ] GitHub Actions CI pipeline green on `main` branch.
