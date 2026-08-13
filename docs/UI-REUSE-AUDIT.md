# UI Reuse Audit & Design System Evaluation: Aarambh360

## 1. Executive Design Overview

The existing Aarambh360 frontend contains a well-conceived, visually appealing design foundation. It utilizes a **modern dark/light palette with neon cyan accents**, **glassmorphism** (`BlurView` intensity 40-50), subtle linear gradients, custom micro-animations, and structured metric cards.

Rather than redesigning from scratch, the new production application should **preserve and modularize** this existing UI aesthetic while moving away from monolithic screen files toward reusable atomic components.

---

## 2. Design System Tokens & Foundations

### 2.1 Color Palette & Theme Tokens
The current application uses theme tokens defined across `src/theme.ts` and inline in screen files:

```typescript
// Core Color Tokens Extracted from Codebase
export const colors = {
  // Backgrounds
  darkBg: ["#0b1220", "#111b2e"] as const,       // Midnight Navy Gradient
  lightBg: ["#e9f3ff", "#ffffff"] as const,      // Crisp Ice/White Gradient

  // Surfaces & Glassmorphism
  darkCard: "rgba(255, 255, 255, 0.05)",         // Glass surface on dark
  darkCardSolid: "#1e293b",                      // Slate 800
  lightCard: "rgba(0, 0, 0, 0.05)",              // Glass surface on light
  lightCardSolid: "#ffffff",                     // White surface

  // Borders
  darkBorder: "rgba(255, 255, 255, 0.10)",
  lightBorder: "rgba(0, 0, 0, 0.12)",

  // Typography
  darkTextPrimary: "#ffffff",                    // High contrast white
  darkTextSecondary: "#94a3b8",                  // Slate 400
  lightTextPrimary: "#0f172a",                   // Slate 900
  lightTextSecondary: "#475569",                 // Slate 600

  // Brand Accents
  accentPrimary: "#06b6d4",                      // Cyan 500 (Primary Action)
  accentSecondary: "#0284c7",                    // Sky 600 (Light Mode Accent)
  accentGold: "#f59e0b",                         // Amber (Streaks & Trophies)
  accentGreen: "#10b981",                        // Emerald (Correct & Accuracy)
  accentRed: "#ef4444",                          // Crimson (Mistakes & Wrong)
};
```

### 2.2 Typography Hierarchy
- **Header 1 (Screen Titles)**: `24px - 26px`, font weight `800` (Extra Bold)
- **Header 2 (Section Titles)**: `16px - 18px`, font weight `700` (Bold)
- **Card Headings**: `15px - 17px`, font weight `700` (Semi-Bold / Bold)
- **Body Text**: `14px`, line height `20px - 22px`
- **Subtext / Captions**: `12px - 13px`, font weight `500`

---

## 3. UI Component Inventory & Reuse Analysis

### 3.1 Dashboards & Metric Cards
| Component / Pattern | Location | Visual / Functional Characteristics | Reuse Strategy |
|---|---|---|---|
| **Stats Metric Trio** | `src/screens/ExamHomeScreen.tsx` | 3-column card row showing Quizzes (Book icon), Accuracy (Chart icon + Green), and MCQ Streak (Flame icon + Amber). | **REUSE & EXTRACT**: Package into `<MetricCardGroup stats={{ quizzes, accuracy, streak }} />`. |
| **Daily Tip Banner** | `src/screens/ExamHomeScreen.tsx`, `MainHomeScreen.tsx` | Glassmorphic `BlurView` card with cyan border and lightbulb emoji icon. | **REUSE & EXTRACT**: Package into `<DailyTipCard tip={dailyTip} />`. |
| **Study Tools Grid** | `src/screens/ExamHomeScreen.tsx` | 3x3 touchable icon cards with subtle background elevation and label. | **REUSE & EXTRACT**: Package into `<StudyToolsGrid onNavigate={handleNav} />`. |
| **Category Quick Selector** | `src/screens/MainHomeScreen.tsx` | Multi-exam selector grid (UPSC, NDA, SSC, etc.). | **REMOVE**: The app is strictly dedicated to UPSC CSE. |

### 3.2 Quiz & Assessment UI
| Component / Pattern | Location | Visual / Functional Characteristics | Reuse Strategy |
|---|---|---|---|
| **Dot Progress Indicator** | `src/screens/QuizScreen.tsx`, `ChapterScreen.tsx` | Horizontal row of numbered dots displaying status: Gray (neutral), Green (correct), Red (wrong), Cyan border (active). | **REUSE & EXTRACT**: Move into `<QuizProgressBar currentIndex={idx} total={count} progress={states} />`. |
| **Circular Accuracy Gauge** | `src/screens/QuizResultScreen.tsx`, `QuizScreen.tsx` | Animated SVG `Circle` component with stroke dashoffset calculation and central percentage text. | **REUSE & EXTRACT**: Move into `<CircularGauge percentage={accuracy} />`. |
| **Option Selector Card** | `src/screens/QuizScreen.tsx`, `ChapterScreen.tsx` | Rounded card with border highlighting on selection, instant green/red feedback, and explanation drawer. | **REUSE & EXTRACT**: Move into `<QuizOptionCard option={opt} isSelected={selected} isCorrect={correct} />`. |
| **Confetti & Streak Popup** | `src/screens/QuizScreen.tsx`, `StreakScreen.tsx` | Animated scale-in modal with `react-native-confetti-cannon` and flame badge. | **REUSE & EXTRACT**: Move into `<StreakMilestoneModal visible={isOpen} streak={count} />`. |
| **Question Report Modal** | `src/screens/QuizScreen.tsx` | Slide-up modal with character count validation and text area. | **REUSE & EXTRACT**: Move into `<ReportQuestionModal visible={isOpen} onSubmit={submitReport} />`. |

### 3.3 Study, Content & Reader UI
| Component / Pattern | Location | Visual / Functional Characteristics | Reuse Strategy |
|---|---|---|---|
| **Top Scroll Progress Bar** | `src/screens/ChapterScreen.tsx` | Animated 4px cyan line at top of viewport tracking scroll depth (`scrollY.interpolate`). | **REUSE & EXTRACT**: Move into `<ScrollProgressBar scrollY={scrollY} />`. |
| **Accordion Content Tree** | `src/screens/SyllabusScreen.tsx`, `examinfoScreen.tsx`, `StrategyScreen.tsx` | Expandable card cards with rotating chevron icon and nested content view. | **REUSE & EXTRACT**: Move into `<AccordionSection title={title} isOpen={open} onToggle={toggle}>`. |
| **Cut-Off Comparison Table** | `src/screens/CutOffScreen.tsx` | Clean tabular view with category column and Prelim/Main/Final score columns. | **REUSE & EXTRACT**: Move into `<CutOffTable data={yearlyData} />`. |
| **Horizontal Year Chip Bar** | `src/screens/CutOffScreen.tsx` | Pill-shaped horizontal scrolling list for filtering by year. | **REUSE & EXTRACT**: Move into `<YearFilterChips years={years} selectedYear={year} onSelect={setYear} />`. |
| **Calendar Matrix Grid** | `src/screens/StreakScreen.tsx` | 7-column monthly grid with active day badges and month navigation arrows. | **REUSE & EXTRACT**: Move into `<StreakCalendar month={currentMonth} activeDates={dates} />`. |
| **Rich Text Editor & Toolbar** | `src/screens/MainScreen.tsx` | WYSIWYG editor using `react-native-pell-rich-editor` for formatting answers. | **REFACTOR**: Keep editor component but isolate inside dedicated Mains writing flow. |

---

## 4. Navigation & Layout Architecture Refactoring

### Current Navigation Defect
Currently, the application mounts `ExamHomeScreen.tsx` as a single screen in a Native Stack Navigator, with a manual, absolute-positioned bottom navigation bar rendered at lines 512-525 of `ExamHomeScreen.tsx`:
```tsx
<LinearGradient colors={...} style={styles.bottomBar}>
  <TouchableOpacity style={styles.tab}><Text>Home</Text></TouchableOpacity>
  <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("MCQScreen")}><Text>Prelims</Text></TouchableOpacity>
  <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("MainScreen")}><Text>Mains</Text></TouchableOpacity>
  <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("ProfileScreen")}><Text>Profile</Text></TouchableOpacity>
</LinearGradient>
```
This causes major usability issues:
- Navigating to `MCQScreen` or `MainScreen` removes the bottom bar entirely.
- Back navigation creates unexpected stack behavior.
- Bottom tabs are not persistent or accessible across the primary tabs.

### Target Navigation Architecture
Implement React Navigation 7 Bottom Tab Navigator with Native Stack sub-navigators:

```plaintext
RootNavigator (Stack)
├── AuthStack
│   ├── LoginScreen
│   ├── SignupScreen
│   └── OnboardingWizardScreen (New)
└── AppTabs (BottomTabNavigator - Glassmorphic / Blurred Bar)
    ├── HomeTab (Stack)
    │   └── ExamHomeScreen (Dashboard)
    ├── LearnTab (Stack)
    │   ├── SubjectsListScreen
    │   ├── TopicsListScreen
    │   ├── LessonReaderScreen (from ChapterScreen)
    │   └── NcertScreen
    ├── PracticeTab (Stack)
    │   ├── MCQScreen (Subject/Class selector)
    │   ├── QuizScreen
    │   ├── QuizResultScreen
    │   └── PYQScreen
    ├── MainsTab (Stack)
    │   ├── MainsQuestionsListScreen
    │   ├── MainsWriteScreen (from MainScreen)
    │   └── MainsEvaluationResultScreen
    └── ProfileTab (Stack)
        ├── ProfileScreen
        ├── StreakScreen
        ├── BookmarksScreen (New)
        ├── MistakesScreen (New)
        └── SubscriptionScreen (New)
```

---

## 5. UI Reuse Master Matrix

| Screen / Component | Target Screen / Module | Status | Transformation Required |
|---|---|---|---|
| `ExamHomeScreen` Dashboard UI | `HomeTab / HomeScreen` | **REUSE** | Keep stats cards, tip card, study grid; wire into Tab Navigator. |
| `QuizScreen` MCQ UI | `PracticeTab / QuizScreen` | **REUSE** | Retain dot progress, option card styles, timers; connect to REST API. |
| `QuizResultScreen` Gauge & Review | `PracticeTab / QuizResultScreen` | **REUSE** | Register in navigation; bind to quiz session submission response. |
| `ChapterScreen` Lesson UI | `LearnTab / LessonScreen` | **REUSE** | Keep scroll progress bar and micro-quiz modal; add Markdown formatting. |
| `SyllabusScreen` Accordion UI | `LearnTab / SyllabusScreen` | **REUSE** | Retain accordion tree; load data from NestJS `/syllabus`. |
| `NcertScreen` Book Grid | `LearnTab / NcertScreen` | **REUSE** | Keep grid layout and external link launcher; connect to backend. |
| `examinfoScreen` Expandable Cards | `LearnTab / ExamInfoScreen` | **REUSE** | Retain card accordion; load from backend `/exam-info`. |
| `CutOffScreen` Year Table | `PracticeTab / CutOffScreen` | **REUSE** | Retain year selector and table; load from backend `/cutoffs`. |
| `StreakScreen` Matrix Calendar | `ProfileTab / StreakScreen` | **REUSE** | Retain custom calendar and share popup; load streak records from API. |
| `ProfileScreen` Profile Header & Stats | `ProfileTab / ProfileScreen` | **REUSE** | Retain stats grid; add target year, daily study goal, subscription tier chip. |
| `MainScreen` Mains Question & Upload | `MainsTab / MainsWriteScreen` | **REFACTOR** | Retain timer, image picker, RichEditor; replace client OpenAI calls with R2 upload + backend evaluation. |
| `NewsScreen` News Card List | `LearnTab / CurrentAffairsScreen` | **REBUILD** | Replace generic NewsAPI reader with curated UPSC Current Affairs cards + GS topic tags. |
| `LoginScreen` & `signupScreen` | `AuthStack / AuthScreens` | **REBUILD** | Upgrade to multi-method authentication (OTP, Google, Email) and multi-step UPSC onboarding wizard. |
