# Data Structures & Content Models Audit: Aarambh360

## 1. Executive Summary

This audit catalogs all data structures discovered across the existing Aarambh360 application (Firestore documents, Realtime Database nodes, client state, and in-code static data), examines their current schemas, relationships, and deficiencies, and defines the structural migration path to the new **PostgreSQL + Prisma** database model.

---

## 2. Inventory of Existing Data Entities

### 2.1 User & Profile Entity
- **Current Storage**: Firestore `users/{uid}`.
- **Current Schema**:
  ```json
  {
    "uid": "string",
    "name": "string",
    "email": "string",
    "phone": "string (10 digits)",
    "dob": "string (DD/MM/YYYY)",
    "gender": "string (Male/Female/Other)",
    "profileCompleted": true,
    "createdAt": "ISO String",
    "updatedAt": "ISO String"
  }
  ```
- **Evaluation & Gaps**: Missing UPSC-specific fields required by the research specification: `target_year` (e.g. 2026/2027), `level` (Beginner/Intermediate/Advanced), `daily_study_time` (e.g. 120 mins), and profile avatar URL.
- **Migration Target**: PostgreSQL `User` and `Profile` tables.

---

### 2.2 Subjects & Topics
- **Current Storage**:
  - RTDB Root: `/{subjectKey}/` (e.g. `History`, `Polity`, `Geography`, `Economy`).
  - RTDB Notes: `notes/{subject}/`.
- **Current Schema**:
  ```json
  {
    "subject": "string",
    "classwise": {
      "6": { "class": 6, "questions": [...] },
      "7": { "class": 7, "questions": [...] }
    }
  }
  ```
- **Evaluation & Gaps**: Unstructured hierarchy. Subjects are mixed with class numbers rather than GS papers (GS1, GS2, GS3, GS4) or topic trees (e.g., Polity $\rightarrow$ Fundamental Rights $\rightarrow$ Article 21).
- **Migration Target**: PostgreSQL `Subject` (id, name, gs_paper, icon) and `Topic` (id, subject_id, name, description).

---

### 2.3 Lessons & NCERT Notes
- **Current Storage**: RTDB `notes/{subject}/{chapter}/`.
- **Current Schema**:
  ```json
  {
    "chapter_title": "string",
    "introduction": "string",
    "detailed_explanation": {
      "section_1": { "content": "string" },
      "section_2": { "content": "string" }
    },
    "summary": "string",
    "mcq": {
      "mcqs": [
        {
          "question": "string",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "answer": "opt2"
        }
      ]
    }
  }
  ```
- **Evaluation & Gaps**: Stored as deeply nested JSON dictionaries. Detailed explanation is keyed arbitrarily (`section_1`, `description`). Lacks Markdown support, mind map image URLs, revision fact lists, and audio/reference links.
- **Migration Target**: PostgreSQL `Lesson` (id, topic_id, title, content [Markdown], mindmap_url, summary, references).

---

### 2.4 Questions, Options & MCQs
- **Current Storage**:
  - RTDB `/{subjectKey}/classwise/{classKey}/questions/`
  - RTDB `notes/{subject}/{chapter}/mcq/`
- **Current Schema**:
  ```json
  {
    "question": "string",
    "options": ["string", "string", "string", "string"] // OR { "A": "...", "B": "..." },
    "answer": "string (option text OR key)",
    "explanation": "string"
  }
  ```
- **Evaluation & Gaps**:
  - Inconsistent `options` format: sometimes an Array of strings, sometimes an Object with keys (`A`, `B`, `C`, `D`).
  - Inconsistent `answer` format: sometimes contains the exact text, sometimes contains the letter key, sometimes contains leading prefixes like `"A. Option text"`.
  - Normalization logic in `QuizScreen.tsx` (lines 266-280) has to run complex regex to guess which option is correct.
- **Migration Target**:
  - PostgreSQL `Question` (id, topic_id, text, type [MCQ/PYQ], difficulty, explanation).
  - PostgreSQL `Option` (id, question_id, text, is_correct, explanation).

---

### 2.5 Previous Year Questions (PYQs)
- **Current Storage**: RTDB `pyq/2025/questions/`.
- **Current Schema**:
  ```json
  {
    "id": "string",
    "number": 1,
    "question": "string",
    "wordLimit": "150 / 250",
    "marks": 10,
    "paper": "GS1"
  }
  ```
- **Evaluation & Gaps**: Only a single year (2025 GS1) exists in the database. Lacks tags for subject, syllabus topic, Prelims vs Mains classification, model answers, and answer breakdown rubrics.
- **Migration Target**: PostgreSQL `PYQ` relation linked to `Question` and `MainsQuestion`.

---

### 2.6 Attempts, Quiz Results & Mistakes
- **Current Storage**: Firestore `users/{uid}/quizResults/{id}`.
- **Current Schema**:
  ```json
  {
    "subject": "string",
    "subjectKey": "string",
    "classKey": "string",
    "correctCount": 18,
    "incorrectCount": 7,
    "totalQuestions": 25,
    "marks": "31.38",
    "accuracy": "72.0",
    "timeTaken": "04:32",
    "createdAt": "serverTimestamp"
  }
  ```
- **Evaluation & Gaps**:
  - Stores only aggregate quiz summaries; does **not** record granular question-by-question attempts (`chosen_option_id`, timestamp, correctness).
  - **Mistakes** are not explicitly persisted to a dedicated collection or table; the app has no auto-logging for incorrect questions to review later.
- **Migration Target**:
  - PostgreSQL `Attempt` (id, user_id, question_id, chosen_option_id, correct, time_taken_seconds, attempted_at).
  - PostgreSQL `Mistake` (id, user_id, question_id, review_count, last_reviewed_at, resolved).

---

### 2.7 Bookmarks
- **Current Storage**: Firestore `users/{uid}/bookmarks/{id}`.
- **Current Schema**:
  ```json
  {
    "subject": "string",
    "question": "string",
    "options": [...],
    "answer": "string",
    "explanation": "string",
    "createdAt": "serverTimestamp"
  }
  ```
- **Evaluation & Gaps**: Denormalizes the entire question, options, answer, and explanation strings into the bookmark document. If a question is edited or corrected, the bookmark contains stale, incorrect data.
- **Migration Target**: PostgreSQL `Bookmark` (id, user_id, question_id [FK], lesson_id [FK], createdAt).

---

### 2.8 Mains Questions, Submissions & Evaluations
- **Current Storage**:
  - Daily Question: RTDB `mains/{year}/{month}/{day}/`.
  - Submissions & Evaluations: **Not stored anywhere** in database! After `evaluateAnswer()` runs in `MainScreen.tsx`, results exist only in React component state (`evalResult`). Once the user leaves the screen, their answer text and evaluation results are permanently lost!
- **Current Schema (RTDB Daily Question)**:
  ```json
  {
    "question": "string",
    "subject": "string",
    "paper": "string",
    "marks": 15,
    "total_attempted": 0
  }
  ```
- **Evaluation & Gaps**: Critical omission. Answer images, OCR text, scores, rubric evaluations, and improvement history are never saved.
- **Migration Target**:
  - PostgreSQL `MainsQuestion` (id, text, subject, gs_paper, max_marks, model_answer, rubric_criteria).
  - PostgreSQL `AnswerSubmission` (id, user_id, mains_question_id, image_url, extracted_text, word_count, status, submitted_at).
  - PostgreSQL `Evaluation` (id, submission_id, score, max_marks, relevance_score, feedback_json, evaluated_at).

---

### 2.9 Streaks & Activity Logs
- **Current Storage**: Firestore `users/{uid}/mcqStreaks/{id}` and `users/{uid}/currentStats/mcqStreak`.
- **Current Schema**:
  ```json
  {
    "date": "2026-08-12",
    "streakCount": 5,
    "updatedAt": "serverTimestamp"
  }
  ```
- **Evaluation & Gaps**: Streaks are calculated and incremented on the mobile client. A user can bypass logic by modifying device time or sending arbitrary payloads.
- **Migration Target**: PostgreSQL `UserStreak` and daily activity log evaluated server-side.

---

### 2.10 Current Affairs & Daily News
- **Current Storage**: Dynamic fetch from NewsAPI REST API (`https://newsapi.org/v2/everything`).
- **Current Schema**: Generic NewsAPI article objects (title, description, url, urlToImage, publishedAt, source).
- **Evaluation & Gaps**: Generic external news feed with no UPSC GS syllabus mapping, no editorial curation, and no linked Prelims/Mains quizzes.
- **Migration Target**: PostgreSQL `CurrentAffairs` (id, date, title, summary, content, source, gs_tags, related_pyq_ids, micro_quiz_id).

---

### 2.11 Plans & Subscriptions
- **Current Storage**: **None**.
- **Evaluation & Gaps**: No existing models for plans, user subscriptions, transaction receipts, Razorpay webhooks, or entitlement limits.
- **Migration Target**: PostgreSQL `Plan` and `Subscription` models with feature entitlement enforcement.

---

## 3. Data Transformation & Normalization Map

| Legacy Data Source | Legacy Location | Target PostgreSQL Entity | Transformation Needed |
|---|---|---|---|
| User Profile | Firestore `users/{uid}` | `User`, `Profile` | Normalize fields; add `target_year`, `study_hours`, `level`. |
| Subjects | RTDB `/{subject}` | `Subject` | Normalize subject keys into unique records with GS paper mappings. |
| Classes / Categories | RTDB `/{subject}/classwise` | `Topic` | Map NCERT class units into structured subject topics. |
| MCQs & Quizzes | RTDB `.../questions` | `Question`, `Option` | Sanitize and separate question body from individual option records; flag `isCorrect`. |
| Chapter Notes | RTDB `notes/{subject}/{ch}` | `Lesson` | Convert nested JSON sections into clean Markdown content bodies. |
| NCERT Books | RTDB `ncert_books` | `NcertResource` | Flatten class/subject PDF dictionaries into relational table. |
| Syllabus | RTDB `Syllabus/UPSC_Exam` | `SyllabusNode` | Convert recursive JSON object into adjacency list or parent-child tree. |
| Cut-Offs | RTDB `cutoffs/{year}` | `CutOffRecord` | Convert year-keyed JSON into relational records: `(year, category, prelim, main, final)`. |
| Exam Info | RTDB `Exam info/...` | `ExamInfoSection` | Flatten into structured key-value sections with markdown support. |
| Daily Mains | RTDB `mains/{y}/{m}/{d}` | `MainsQuestion` | Normalize into persistent question entity with publication date. |
| Submissions & AI Evals | *None (Client memory)* | `AnswerSubmission`, `Evaluation` | **NEW**: Persist image URL, extracted text, AI score, and rubric feedback JSON. |
| Bookmarks | Firestore `.../bookmarks` | `Bookmark` | Replace full text duplication with foreign keys (`userId`, `questionId`, `lessonId`). |
| Quiz Results | Firestore `.../quizResults` | `Attempt`, `QuizSession` | Log individual question attempts and aggregate quiz sessions. |
