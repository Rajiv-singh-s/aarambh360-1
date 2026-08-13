# Step 18 — Final Mobile Product Integration & End-to-End UX

This document records the final mobile integration architecture, navigation, bootstrap logic, services, personalization, monetization, and known limitations for Aarambh360.

---

## 1. Mobile Architecture Overview

The Aarambh360 mobile app is built using **React Native + Expo SDK 54**. It has been completely decoupled from the legacy direct Firestore/RTDB calls and integrated with the NestJS backend API client.

```plaintext
              [ React Native App (Expo SDK 54) ]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           [ AuthProvider ]      [ useContent ]
           - Firebase Session    - Learning Content
           - Backend Profile     - Syllabus Tree
           - Dev Token Sync      - NCERT/PYQ/Exams
                    │
                    ├─────────► [ useQuizEngine ]
                    │           - Server-authoritative Quiz
                    │           - Session completion & scoring
                    │
                    ├─────────► [ uploadService + R2 ]
                    │           - Presigned upload URLs
                    │           - Binary upload to R2
                    │
                    └─────────► [ mainsService ]
                                - OCR processing lifecycle
                                - AI evaluation polling
                                - Rubric feedback display
```

---

## 2. Authentication & App Bootstrap

When the application starts, it runs a clean initialization sequence in [`AuthContext.tsx`](file:///c:/Users/Rajiv%20Singh/Documents/Projects/aarambh360/apps/mobile/src/context/AuthContext.tsx):

1. **Restore Firebase Session**: Listen for Firebase Authentication changes via `onAuthStateChanged`.
2. **Authenticate with Backend**: Exchange the Firebase ID token for a backend session via `POST /auth/login`, provisioning the PostgreSQL database user if needed.
3. **Load User & Entitlements**: Fetch profile data, user preferences, and premium entitlements via `GET /auth/me` and `GET /subscriptions/me/entitlements`.
4. **Register Device Token**: Auto-register a platform-specific development push notification token (`POST /notifications/register-token`) for Mains evaluation alerts.
5. **Track Open Event**: Log the `APP_OPEN` analytics event to the backend.
6. **Navigate**: Replace route with `MainHomeScreen` (if profile is complete) or `Signup` (if profile is incomplete).
7. **Clean Bootstrap UX**: Displays a full-screen "Checking session..." loader rather than rendering the login fields immediately, preventing flickering.

---

## 3. Navigation Audit

All **20 navigable screens** are registered in [`App.tsx`](file:///c:/Users/Rajiv%20Singh/Documents/Projects/aarambh360/apps/mobile/App.tsx):
- `LoginScreen` / `signupScreen` (Authentication and Onboarding)
- `MainHomeScreen` (Exam category selection)
- `ExamHomeScreen` (UPSC Dashboard)
- `MCQScreen` / `QuizScreen` / `QuizResultScreen` (MCQ learning flow)
- `ChapterScreen` / `NoteScreen` / `NcertScreen` / `SyllabusScreen` (Core content study flow)
- `CutOffScreen` / `StreakScreen` / `ProfileScreen` / `SubscriptionScreen` (Account & statistics)
- `MainScreen` (Daily Mains AI evaluation workflow)
- `pyqScreen` / `examinfoScreen` / `StrategyScreen` / `NewsScreen` (Reference banks)

---

## 4. Feature Integrations

### Content Integration
All content screens leverage [`useContent.ts`](file:///c:/Users/Rajiv%20Singh/Documents/Projects/aarambh360/apps/mobile/src/hooks/useContent.ts) to query the NestJS backend:
- NCERT textbooks are resolved using `GET /ncert` and loaded into the native viewer.
- Syllabus tree is fetched via `GET /syllabus/UPSC_CSE/tree` with 5-minute client-side caching.
- Previous Year Questions are listed via `GET /pyq?year=`.

### Server-Authoritative Quiz Engine
Interactive MCQ practice is powered by [`useQuizEngine.ts`](file:///c:/Users/Rajiv%20Singh/Documents/Projects/aarambh360/apps/mobile/src/hooks/useQuizEngine.ts):
- Authoritative scores are calculated and locked on the backend.
- Quiz results are compiled and sent to `POST /quiz/sessions/:id/complete` to update streak calendars and mistakes.
- Errors during answer submission or network timeouts show retry buttons without abandoning the session.

### Daily Mains AI Evaluation Pipeline
Located in [`MainScreen.tsx`](file:///c:/Users/Rajiv%20Singh/Documents/Projects/aarambh360/apps/mobile/src/screens/MainScreen.tsx):
1. **R2 Upload**: Selected images are uploaded to pre-signed S3 URLs via `uploadMainsImages` and confirmed via `/storage/confirm`.
2. **OCR Extraction**: Extracted text from `mains_submissions` is populated into the Pell rich text editor for review and edit.
3. **AI Evaluation**: Submitted text is processed by Gemini/OpenAI using RAG-grounded model rubrics, polling `GET /mains/submissions/:id/evaluation` until complete.
4. **Rubric Result**: Structured display showing score, relevance, dimension breakdowns, strengths, suggestions, missing points, and source files.

### Subscriptions & Ads Gating
- Displays the user's plan (FREE, PLUS, PREMIUM) and remaining Mains evaluation quotas.
- Gated by entitlements: Free tier users are served test ads via `AdBanner` on the home dashboard. Premium users have `removeAds: true` in their entitlements, suppressing all advertisements.

---

## 5. Known Limitations

1. **Razorpay Native Billing**: Pushed to client-side deferred mode. Subscriptions in dev mode upgrade instantly via `POST /subscriptions/create` for manual testing.
2. **AdMob Native SDK**: Production-ready AdMob SDK integration is deferred to Step 19/20. Current implementation uses placeholder test banner structures gated by entitlements.
3. **Device Token Mocking**: Mobile client registers a dev push token on startup since native APNs/FCM setup is deferred to step 20 release prep.
