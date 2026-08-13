# Legacy Codebase & Technical Audit: Aarambh360

## 1. Executive Summary

Aarambh360 is currently a partially developed mobile application built using **React Native (0.81.5)**, **Expo SDK 54 (~54.0.23)**, **TypeScript (~5.9.2)**, and a dual **Firebase (v12.5.0)** architecture combining **Firebase Cloud Firestore** and **Firebase Realtime Database (RTDB)** with direct client-side calls to the **OpenAI API (gpt-4o-mini)**.

The project demonstrates strong visual design taste (glassmorphism via BlurView, rich dark/light mode gradients, animated score gauges, and clean card layouts), but suffers from fundamental structural, architectural, and security deficiencies:
- **No Backend Layer**: The client talks directly to Firebase Firestore, Firebase Realtime Database, NewsAPI, and OpenAI.
- **Critical Security Exposure**: Secret API keys (OpenAI, NewsAPI) and complete database manipulation privileges reside on the mobile client.
- **Orphaned Root Code Duplication**: More than 20 legacy screen files remain duplicated at the root directory alongside `src/screens/`.
- **Zero Automated Testing or CI/CD**: No unit tests, integration tests, ESLint configuration, or automated delivery pipelines.
- **Incomplete / Placeholder Features**: Multiple 0-byte stub files (`LeaderboardScreen.tsx`, `MainsWritePanel.tsx`, `types.ts`, `chapterwise_mcqScreen.tsx`) and hardcoded exam category stubs.

---

## 2. Technology Stack & Dependencies

### Core Runtime & Frameworks
| Layer | Technology | Current Version | Status / Notes |
|---|---|---|---|
| Runtime | React Native | `0.81.5` | React 19 compatible, New Architecture enabled (`newArchEnabled: true`) |
| Platform | Expo SDK | `~54.0.23` | Latest Expo SDK 54 |
| Language | TypeScript | `~5.9.2` | Strict mode enabled in `tsconfig.json` |
| UI Framework | React | `19.1.0` | React 19.1.0 runtime |
| Build Tooling | EAS Build | CLI `>= 16.28.0` | Configured in `eas.json` |

### Dependency Analysis (`package.json`)
```json
{
  "dependencies": {
    "@expo/vector-icons": "^15.0.3",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/bottom-tabs": "^7.8.4",
    "@react-navigation/native": "^7.1.19",
    "@react-navigation/native-stack": "^7.6.2",
    "@react-navigation/stack": "^7.6.4",
    "expo": "~54.0.23",
    "expo-blur": "~15.0.7",
    "expo-dev-client": "~6.0.18",
    "expo-file-system": "~19.0.17",
    "expo-image-picker": "~17.0.8",
    "expo-linear-gradient": "~15.0.7",
    "expo-linking": "~8.0.8",
    "expo-sharing": "^14.0.7",
    "expo-status-bar": "~3.0.8",
    "firebase": "^12.5.0",
    "lottie-react-native": "~7.3.1",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-calendars": "^1.1313.0",
    "react-native-confetti-cannon": "^1.5.2",
    "react-native-pell-rich-editor": "^1.10.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0",
    "react-native-share": "^12.2.1",
    "react-native-svg": "15.12.1"
  }
}
```

### Dependency Health & Observations
1. **Unused Dependencies**:
   - `@react-navigation/bottom-tabs`: Installed but unused in navigation (`App.tsx` uses only `createNativeStackNavigator`). Bottom tabs in `ExamHomeScreen.tsx` are hardcoded `TouchableOpacity` elements.
   - `@react-navigation/stack`: Installed alongside `@react-navigation/native-stack`. Native stack is sufficient.
   - `react-native-calendars`: Installed but `StreakScreen.tsx` implements its own custom matrix calendar generator.
   - `lottie-react-native`: Installed but no Lottie animation assets or components are used in any screen.
   - `@react-native-async-storage/async-storage`: Installed but offline caching/local persistence is not implemented; app relies entirely on live Firebase listeners.
2. **Missing Dependencies**:
   - `react-native-webview`: Imported and used in `NewsScreen.tsx` (`import { WebView } from "react-native-webview"`), but is **omitted from `package.json`** dependencies (relies on transitive Expo dev client bundling, which will break in production builds).
   - No HTTP client like `axios` (relies on raw `fetch`).
   - No state management library (Redux Toolkit, Zustand) or React Query / TanStack Query.
   - No testing libraries (`jest`, `@testing-library/react-native`).

---

## 3. Project Structure & Codebase Health

### File Tree Breakdown
```plaintext
aarambh360/
├── App.tsx                     # Main navigation container (Native Stack)
├── app.json                    # Expo project configuration
├── eas.json                    # Expo Application Services configuration
├── index.ts                    # Entry point calling registerRootComponent(App)
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration (strict: true)
├── assets/                     # App icons and splash screen assets
├── [Root Duplicate Screens]    # 22 legacy root files (CutOffScreen, ExamHomeScreen, etc.)
└── src/
    ├── firebaseConfig.ts       # Firebase initialization (Auth, Firestore, RTDB)
    ├── theme.ts                # Minimal color scheme helper hook
    ├── types.ts                # Empty file (0 bytes)
    ├── modules/                # Direct AI/DB service calls
    │   ├── mainsDB.ts          # RTDB readers for Mains daily question
    │   ├── mainsEvaluate.ts    # Direct OpenAI evaluation API caller
    │   └── mainsOCR.ts         # Direct OpenAI OCR API caller
    └── screens/                # Active application screens
        ├── ChapterScreen.tsx
        ├── CutOffScreen.tsx
        ├── ExamHomeScreen.tsx
        ├── LeaderboardScreen.tsx (0 bytes)
        ├── LoginScreen.tsx
        ├── MCQScreen.tsx
        ├── MainHomeScreen.tsx
        ├── MainScreen.tsx
        ├── MainsWritePanel.tsx (0 bytes)
        ├── NcertScreen.tsx
        ├── NewsScreen.tsx
        ├── NoteScreen.tsx
        ├── ProfileScreen.tsx
        ├── QuizResultScreen.tsx (Not registered in App.tsx)
        ├── QuizScreen.tsx
        ├── StrategyScreen.tsx
        ├── StreakScreen.tsx
        ├── SyllabusScreen.tsx
        ├── examinfoScreen.tsx
        ├── pyqScreen.tsx
        ├── signupScreen.tsx
        └── styles/
            └── QuizScreen.styles.ts
```

### Critical Codebase Anomalies
1. **Root vs. `src/` Code Duplication**:
   The root directory contains stale, unmaintained versions of nearly all screen files (`CutOffScreen.tsx`, `ExamHomeScreen.tsx`, `MCQScreen.tsx`, `NoteScreen.tsx`, etc.). `App.tsx` imports exclusively from `./src/screens/`. The root files create confusion and build risk.
2. **0-Byte Stub Files**:
   - `src/screens/LeaderboardScreen.tsx`
   - `src/screens/MainsWritePanel.tsx`
   - `src/types.ts`
   - `aarambh360/chapterwise_mcqScreen.tsx`
3. **Unregistered Standalone Screens**:
   - `QuizResultScreen.tsx`: Complete 628-line screen file with SVG score gauge and review breakdown, but is **never registered** in `App.tsx`'s `Stack.Navigator`. Instead, `QuizScreen.tsx` duplicates score rendering inline.
4. **Navigation Inconsistencies**:
   - Navigation uses a single flat native stack navigator in `App.tsx`.
   - Bottom navigation bars are manually rendered inside `ExamHomeScreen.tsx` with absolute positioning, leading to inconsistent tab transitions across screens.
5. **Types and Contracts**:
   - `src/types.ts` is empty (0 bytes). Navigation params, data models, and API interfaces are defined ad-hoc or typed as `any` in screen files.

---

## 4. Complete Screen Inventory & Functional Audit

| Screen Name | File Path | Route Key | Data Source | Functional State | Issues / Gaps |
|---|---|---|---|---|---|
| **Login** | `src/screens/LoginScreen.tsx` | `Login` | Firebase Auth & Firestore (`users/{uid}`) | Working | Combined sign-in/sign-up catch fallback; no password reset; no OTP; no Google sign-in. |
| **Signup / Profile Setup** | `src/screens/signupScreen.tsx` | `Signup` | Firestore (`users/{uid}`) | Working | Basic demographic fields (name, phone, dob, gender); missing UPSC target year, level, study time. |
| **Main Home (Category Hub)** | `src/screens/MainHomeScreen.tsx` | `MainHomeScreen` | Firestore (`users/{uid}`) | Working | Multi-exam hub (UPSC, NDA, SSC, Banking, Railway, StatePSC). Only UPSC leads to content. |
| **Exam Home (UPSC Dashboard)** | `src/screens/ExamHomeScreen.tsx` | `ExamHomeScreen` | Firestore (`users/{uid}`, `quizResults`, `mcqStreak`) | Working | Rich dashboard with Quizzes, Accuracy, Streak, Daily Tip, and Study Tools grid. Custom bottom bar. |
| **MCQ Practice Selector** | `src/screens/MCQScreen.tsx` | `MCQScreen` | Firebase RTDB (`/`, `/{subject}/classwise`) | Working | Fetches subjects and classes from RTDB; modal count selector (10, 20, 25, 50, 100, 200). |
| **Quiz Execution** | `src/screens/QuizScreen.tsx` | `QuizScreen` | Firebase RTDB (Questions) + Firestore (Results, Leaderboard, Bookmarks, Reports) | Working | Full interactive MCQ quiz with progress dots, timer, review mode, bookmarking, report question, streak update. Large monolithic file (1278 lines). |
| **Quiz Result** | `src/screens/QuizResultScreen.tsx` | *None (Unregistered)* | Navigation Params + Firestore | Orphaned | Well-designed animated gauge and breakdown, but unreachable via `App.tsx`. |
| **Daily Mains** | `src/screens/MainScreen.tsx` | `MainScreen` | Firebase RTDB (`mains/`) + OpenAI API (OCR & Eval) | Partially Working | Daily question fetch; gallery/camera upload; rich text editor; direct client-side OpenAI evaluation. |
| **NCERT Books** | `src/screens/NcertScreen.tsx` | `NcertScreen` | Firebase RTDB (`ncert_books`) | Working | Displays NCERT PDFs grouped by class and subject; opens external PDF links via `Linking.openURL`. |
| **Notes & Chapters** | `src/screens/NoteScreen.tsx` | `NotesScreen` | Firebase RTDB (`notes/`) | Working | Drill-down from subjects to chapters; navigates to `ChapterScreen`. |
| **Chapter Detail & Reader** | `src/screens/ChapterScreen.tsx` | `ChapterScreen` | Firebase RTDB (`notes/{subject}/{chapter}`) | Working | Displays chapter introduction, explanation, summary with scroll progress indicator; micro-quiz with 10 random MCQs. |
| **Syllabus** | `src/screens/SyllabusScreen.tsx` | `SyllabusScreen` | Firebase RTDB (`Syllabus/UPSC_Exam`) | Working | Recursive accordion tree rendering Prelims/Mains syllabus. |
| **Exam Info** | `src/screens/examinfoScreen.tsx` | `ExamInfoScreen` | Firebase RTDB (`Exam info/upsc_cse_2026`) | Working | Overview, key dates, eligibility, and exam pattern with expandable accordion sections. |
| **Cut-Offs** | `src/screens/CutOffScreen.tsx` | `CutOffScreen` | Firebase RTDB (`cutoffs/{year}`) | Working | Horizontal year selector (2015-2025); category-wise Prelims, Mains, and Final cut-off table. |
| **Strategy** | `src/screens/StrategyScreen.tsx` | `StrategyScreen` | Static in-code array | Working | Static accordion with Prelims, Mains, Interview, Optional strategy, common mistakes, topper tips. |
| **PYQs** | `src/screens/pyqScreen.tsx` | `PYQScreen` | Firebase RTDB (`pyq/2025/questions`) | Partially Working | Hardcoded to GS1 2025 questions in RTDB; lacks filter by subject, year, or exam type. |
| **Daily News** | `src/screens/NewsScreen.tsx` | `NewsScreen` | NewsAPI REST endpoint | Working | Fetches 50 articles matching UPSC keywords; in-app WebView reader. Exposed NewsAPI key. |
| **MCQ Streak** | `src/screens/StreakScreen.tsx` | `StreakScreen` | Firestore (`users/{uid}/mcqStreaks`) | Working | Custom calendar view showing active days; streak counter and social share dialog. |
| **Profile** | `src/screens/ProfileScreen.tsx` | `ProfileScreen` | Firestore (`users/{uid}`, `quizResults`, `mcqStreak`) | Working | Profile editor, avatar placeholder, stats summary (quizzes taken, accuracy rate, streak). |
| **Leaderboard** | `src/screens/LeaderboardScreen.tsx` | *None* | None | Empty (0 B) | Non-functional stub file. |
| **Mains Write Panel** | `src/screens/MainsWritePanel.tsx` | *None* | None | Empty (0 B) | Non-functional stub file. |

---

## 5. Security & Architectural Deficiencies

1. **Client-Side AI Evaluation & Exposed Keys**:
   - `src/modules/mainsEvaluate.ts` and `src/modules/mainsOCR.ts` invoke `https://api.openai.com/v1/chat/completions` directly from the user's mobile device using `process.env.EXPO_PUBLIC_OPENAI_API_KEY`.
   - Any user can extract this API key or spam evaluation requests at the developer's direct expense.
2. **Exposed Third-Party Keys**:
   - `src/screens/NewsScreen.tsx` hardcodes `API_KEY = "4044ce8f82934ef4b96ac2ccc0b9869f"`.
3. **Unvalidated Client-Side Database Writes**:
   - The client calculates its own quiz accuracy and marks (`totalMarks = correctCount * 2 - incorrectCount * 0.66`) and writes results directly into `users/{uid}/quizResults` and `leaderboard/{subjectKey}/entries`.
   - Users can manipulate network payloads to inject arbitrary leaderboard scores.
4. **No Centralized API or Service Layer**:
   - Firebase Realtime Database and Firestore calls are embedded directly inside UI `useEffect` hooks and button callbacks.
5. **No Offline Support or Caching**:
   - Despite `@react-native-async-storage/async-storage` being installed, every screen re-fetches full data on mount, leading to excessive bandwidth usage and poor offline UX.

---

## 6. Audit Classification Summary

| Classification | Screen / Component / Module | Path | Rationale | Recommended Action |
|---|---|---|---|---|
| **REUSE** | Design System & Theme Tokens | `src/theme.ts` | Theme colors and tokens are cohesive and visually appealing. | Carry forward into a structured `theme/` module. |
| **REUSE** | Cut-Off Screen UI | `src/screens/CutOffScreen.tsx` | Clean horizontal year selector and comparison table layout. | Keep UI layout; bind to NestJS REST endpoint. |
| **REUSE** | Exam Info UI | `src/screens/examinfoScreen.tsx` | Well-structured expandable card accordion. | Keep UI layout; bind to NestJS REST endpoint. |
| **REUSE** | Syllabus Screen UI | `src/screens/SyllabusScreen.tsx` | Clean recursive accordion and scroll-to-top feature. | Keep UI layout; bind to NestJS REST endpoint. |
| **REUSE** | NCERT Reader UI | `src/screens/NcertScreen.tsx` | Clean subject grid and PDF launcher. | Keep UI layout; bind to NestJS REST endpoint. |
| **REUSE** | Streak Calendar UI | `src/screens/StreakScreen.tsx` | Custom matrix calendar and pulse animation. | Keep UI layout; bind to NestJS streak API. |
| **REFACTOR** | Main Exam Dashboard | `src/screens/ExamHomeScreen.tsx` | Excellent dashboard cards, but needs Bottom Tab integration and NestJS API data. | Extract cards to modular components; wire to proper Tab Navigator. |
| **REFACTOR** | MCQ Quiz Engine | `src/screens/QuizScreen.tsx` | Great dot-progress system and timer, but bloated (1278 lines) and tightly coupled to Firebase. | Break down into `QuizCard`, `ProgressDots`, `ExplanationModal`; bind to NestJS `/attempts`. |
| **REFACTOR** | Chapter & Lesson Reader | `src/screens/ChapterScreen.tsx` | Good progress bar and micro-quiz concept, but needs rich markdown/R2 support. | Refactor to support Markdown/HTML lesson rendering and backend quiz submission. |
| **REFACTOR** | Profile Screen | `src/screens/ProfileScreen.tsx` | Good stat cards, but missing target year, prep level, and daily study target fields. | Update schema to match new UPSC user profile requirements. |
| **REFACTOR** | PYQ Screen | `src/screens/pyqScreen.tsx` | Good card design, but currently hardcoded to single year/paper. | Add dynamic subject, year, and paper filters. |
| **REBUILD** | Mains Answer Upload & Evaluation | `src/screens/MainScreen.tsx`, `src/modules/*` | Current client-side OpenAI calls and OCR are insecure and lack RAG grounding. | Rebuild client flow: Upload image to R2 -> Backend OCR -> Backend RAG + LLM evaluation -> Polling/webhook results. |
| **REBUILD** | Auth & Onboarding Flow | `src/screens/LoginScreen.tsx`, `src/screens/signupScreen.tsx` | Lacks OTP login, Google OAuth, and UPSC onboarding steps (target year, study hours). | Rebuild as multi-step onboarding wizard integrated with Firebase Auth + NestJS `/auth/login`. |
| **REBUILD** | Current Affairs & News | `src/screens/NewsScreen.tsx` | Currently hits public NewsAPI with exposed key; lacks GS topic tagging and quiz linking. | Rebuild to consume curated Current Affairs feed from NestJS backend. |
| **REMOVE** | Root Duplicate Screens | `aarambh360/*.tsx` | 22 outdated duplicate files left over from prior reorganizations. | Delete all root-level duplicate `.tsx` files. |
| **REMOVE** | Empty Stub Files | `src/screens/LeaderboardScreen.tsx`, `MainsWritePanel.tsx`, `types.ts` | 0-byte stub files with no functionality. | Remove or replace with actual typed implementations. |
| **REMOVE** | Multi-Exam Category Hub | `src/screens/MainHomeScreen.tsx` | Non-UPSC exams (NDA, SSC, Banking, etc.) conflict with focused UPSC 360° product scope. | Replace with dedicated UPSC Onboarding and Dashboard. |
