# Architecture Gap Analysis: Current vs. Target Aarambh360

## 1. High-Level Architecture Comparison

```plaintext
========================================================================================
CURRENT ARCHITECTURE (Legacy / Partial Prototype)
========================================================================================
[Mobile App: React Native + Expo + React 19]
      │
      ├── (Direct Auth) ──────────────► [Firebase Authentication]
      │
      ├── (Direct Reads/Writes) ──────► [Firebase Cloud Firestore] (Profiles, Results, Streaks)
      │
      ├── (Direct Reads) ─────────────► [Firebase Realtime Database] (MCQs, Notes, Syllabus, etc.)
      │
      ├── (Direct API Call w/ Key) ───► [OpenAI API (gpt-4o-mini)] (Client OCR & Eval)
      │
      └── (Direct API Call w/ Key) ───► [NewsAPI.org] (External News Feed)

  ❌ NO Backend API Server
  ❌ NO Relational Database / ORM
  ❌ NO Content Management System (Admin CMS)
  ❌ NO RAG Pipeline / Knowledge Base Grounding
  ❌ NO Secure Cloud Object Storage (R2)
  ❌ NO Subscription / Entitlement Engine
  ❌ NO Automated CI/CD or Testing

========================================================================================
TARGET PRODUCTION ARCHITECTURE (Aarambh360 v1.0 Specification)
========================================================================================
[Mobile App: React Native + Expo]       [Admin Portal: Next.js + TailwindCSS]
             │                                              │
             │ (Authorization: Bearer <Firebase JWT>)       │ (Session / Role Guard)
             ▼                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                            NestJS Modular Monolith API                               │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┬────────────────────┐  │
│  │ Auth Guard   │ Users Module │ Learn/Lesson │ Quiz/Attempt │ Mains Eval Module  │  │
│  ├──────────────┼──────────────┼──────────────┼──────────────┼────────────────────┤  │
│  │ CurrentAffair│ Bookmarks    │ Mistakes     │ Subscription │ RAG / AI Gateway   │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┴────────────────────┘  │
└──────────────┬──────────────────────┬──────────────────────┬─────────────────────────┘
               │                      │                      │
               ▼                      ▼                      ▼
      [PostgreSQL Database]   [Cloudflare R2]      [AI Provider / LLM]
      - Prisma ORM            - Answer Images      - Gemini / GPT-4o
      - pgvector (Embeddings) - Lesson Assets      - OCR Pipeline
      - Relational Integrity  - Static PDFs        - UPSC Rubric Engine
```

---

## 2. Detailed Gap Matrix

| Architectural Domain | Current Implementation | Target Specification | Gap Severity | Description & Required Resolution |
|---|---|---|---|---|
| **Backend Layer** | None. Pure client-to-BaaS architecture. | NestJS TypeScript modular monolith. | **CRITICAL** | Build NestJS backend covering auth guards, content APIs, attempt submission, streak validation, and AI orchestration. |
| **Primary Database** | Cloud Firestore + Realtime Database (JSON tree). | PostgreSQL via Prisma ORM. | **CRITICAL** | Design relational Prisma schema; migrate and normalize RTDB/Firestore data; decommission direct database access. |
| **Authentication Flow** | Client-only Firebase Auth (Email/Password). | Firebase Auth (Email, Phone OTP, Google) verified via NestJS `FirebaseAdminGuard`. | **HIGH** | Retain Firebase on mobile for auth token issuance; implement backend JWT verification and PostgreSQL user provisioning. |
| **Storage Architecture** | In-memory base64 strings; no persistent image store. | Cloudflare R2 (S3-compatible object storage). | **HIGH** | Implement secure pre-signed R2 upload URLs for student answer sheets, lesson diagrams, and mind maps. |
| **Mains AI Evaluation** | Client-side `fetch('https://api.openai.com')` with raw prompt and zero context. | Backend OCR $\rightarrow$ RAG retrieval against syllabus knowledge base $\rightarrow$ Structured UPSC rubric scoring $\rightarrow$ Persistent database evaluation record. | **CRITICAL** | Remove OpenAI calls from mobile app. Implement backend AI evaluation worker with prompt engineering and token cost quotas. |
| **RAG & Knowledge Grounding** | None. Model generates hallucinated feedback with no syllabus grounding. | PostgreSQL + `pgvector` storing embeddings of NCERT notes, model answers, and PYQs. | **HIGH** | Set up embedding generation pipeline for curated syllabus content; perform similarity search before LLM prompt assembly. |
| **Admin & CMS** | None. Content is manually edited via Firebase console. | Next.js internal admin dashboard. | **HIGH** | Build admin portal for curriculum editors to create/edit topics, lessons, MCQs, daily news, and review reports. |
| **Monetization & Entitlements** | None. Entire app is open with no paywall or tiers. | Razorpay Subscriptions (Free / Plus / Premium) with server-enforced quotas. | **HIGH** | Implement Plan and Subscription tables, Razorpay webhook handlers, and entitlement guards on API endpoints. |
| **Advertising Integration** | None. | Google AdMob (Banner & Native ads in free tier). | **MEDIUM** | Integrate `react-native-google-mobile-ads` with tier-based ad rendering. |
| **API Client & Networking** | Ad-hoc `fetch()` and Firebase SDK calls scattered across screens. | Centralized Axios / Fetch API client with automatic Bearer token injection and error interceptors. | **HIGH** | Create structured `api/` service layer on mobile with typed request/response contracts. |
| **State Management** | Local `useState` and live Firebase snapshot listeners. | Lightweight global state (Zustand or React Context) + Server state caching. | **MEDIUM** | Centralize user profile, auth session, and active quiz state; eliminate duplicate snapshot listeners. |
| **Navigation Architecture** | Single flat stack with manual in-screen bottom bars. | React Navigation 7 Tabs (Home, Learn, Practice, Mains, Profile) + nested stacks. | **MEDIUM** | Refactor navigation into standard React Navigation bottom tab pattern. |

---

## 3. Module-by-Module Gap Analysis

### 3.1 Authentication & User Management
- **Current**: Mobile app talks to Firebase Auth, then checks/updates `users/{uid}` in Firestore.
- **Target**: Mobile signs in via Firebase Auth, receives ID token, calls `POST /auth/login` on NestJS. Backend verifies token, finds or creates `User` in PostgreSQL, and returns user profile, settings, and subscription entitlements.

### 3.2 Learn & Curriculum Module
- **Current**: Reads raw unstructured JSON from RTDB `notes/{subject}/{chapter}`.
- **Target**: NestJS `SubjectsModule`, `TopicsModule`, `LessonsModule` serving clean relational data. Lessons formatted in Markdown with cloud-hosted images on Cloudflare R2.

### 3.3 MCQ & Quiz Engine
- **Current**: Mobile pulls questions from RTDB, shuffles locally, evaluates answers client-side, calculates marks, and writes summary directly to Firestore.
- **Target**: Mobile requests question batch from `GET /questions?topicId=X&count=Y`. Mobile submits user answers to `POST /attempts/session`. Backend computes marks, accuracy, saves granular attempts, updates mistakes log, updates user streak atomically, and returns structured result.

### 3.4 Mains Evaluation Pipeline
- **Current**: Mobile picks images, converts to base64, sends to OpenAI `gpt-4o-mini` with prompt: *"Extract text"*, puts text into RichEditor, sends text to OpenAI with prompt: *"Evaluate answer"*, displays score in modal, never saves result.
- **Target**:
  1. Mobile uploads answer image(s) to Cloudflare R2 via pre-signed URL.
  2. Mobile calls `POST /mains/submissions` with `mainsQuestionId` and `imageUrl`.
  3. Backend triggers OCR (Tesseract / Vision / GPT-4o-mini OCR).
  4. Backend queries `pgvector` for top-k syllabus passages and model answers.
  5. Backend prompts LLM with UPSC evaluation rubric (Introduction, Content, Analysis, Structure, Conclusion).
  6. Backend stores structured evaluation in PostgreSQL `evaluations` table and returns JSON response to mobile client.

### 3.5 Current Affairs & News
- **Current**: Direct fetch from public NewsAPI with hardcoded key. No GS tags or UPSC syllabus mapping.
- **Target**: NestJS `CurrentAffairsModule` serving daily curated news items created by editorial team via Admin CMS, tagged with GS subjects and linked to PYQs and micro-quizzes.

### 3.6 Subscriptions & Entitlements
- **Current**: Non-existent.
- **Target**: NestJS `SubscriptionsModule` with Razorpay subscription creation, webhook verification, and entitlement checking (e.g., Free: 1 eval/week, Plus: 5 evals/month, Premium: unlimited).

---

## 4. Key Architectural Conclusions

1. **The mobile UI is salvageable and high-quality**, but its data layer must be completely disconnected from Firebase Firestore/RTDB and rewired to the NestJS REST API.
2. **The backend and database must be created from scratch** following the PRD specifications in `aarambh360-research.md`.
3. **The AI evaluation workflow must be entirely relocated to the backend** to ensure prompt security, token cost control, rate limiting, and syllabus grounding.
