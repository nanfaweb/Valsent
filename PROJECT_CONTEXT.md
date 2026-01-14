# Valsent Exam Platform - Project Context

## 1. Overview
Valsent is a SaaS exam preparation platform tailored for BBA entrance exams. It features a robust mock exam system with real-time timers, multi-section support, and detailed result analytics. The platform differentiates between "Trial" users (free access to 1 mock) and "Paid" users (lifetime access to all mocks).

## 2. Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript.
- **Styling**: CSS Modules (scoped styles), Vanilla CSS variables for theming.
- **Backend**: Supabase (PostgreSQL), Supabase Auth.
- **State Management**: React Context (`AuthContext`), Local State.

## 3. Database Schema
The database (PostgreSQL) is managed via Supabase. Key tables include:

### Core Tables
- **`profiles`**: User metadata. Contains `trial_used` (boolean) to enforce single trial attempt.
- **`mocks`**: Exam definitions.
  - Columns: `id`, `title`, `duration_minutes`, `total_questions`, `is_trial`, `difficulty`.
- **`questions`**: Individual questions linked to mocks.
  - Columns: `id`, `mock_id`, `type` ('mcq' checked constraint), `question_text`, `choices` (JSONB), `correct_answer`, `section` (Text: 'Mathematics' | 'English').
  - **Note**: `type` is often 'mcq'. The `section` column is used to grouping questions in the UI.

### User Progress
- **`attempts`**: Tracks a user's specific attempt at an exam.
  - Columns: `id`, `user_id`, `mock_id`, `status` ('in_progress', 'paused', 'submitted'), `score`, `answers` (JSONB), `current_section`, `remaining_seconds`.
  - **Logic**: A user can have multiple attempts for paid exams (Retakes).

## 4. Workflows & Features

### A. Authentication & User State
- Managed via `AuthContext`.
- Dashboard dynamically renders based on 3 states:
  1.  **Trial Available**: New users. Can start the free Trial Mock.
  2.  **Trial Completed**: Users who finished the trial but haven't paid. Locked out of other content.
  3.  **Plan Purchased**: Users with active subscription. Full access.

### B. Exam System (`src/app/exam`)
- **Browse Page** (`/exams`):
  - Displays all available mocks in a 3-column grid.
  - Handling:
    - **Instructions**: Clicking "Start" or "Retake" navigates to `/exam/[id]` (Instruction Page).
    - **Resume**: Checks for `in_progress` attempts via `getAvailableExams` server action.
- **Instruction Page** (`/exam/[id]`):
  - Fetches exam metadata.
  - **Start Logic**: Calls `startExamAttempt`. If an unfinished attempt exists, it resumes. If "Retake" or new, it creates a NEW row in `attempts`.
- **Test Player** (`src/components/features/TestPlayer.tsx`):
  - **Sections**: Supports sequential or free navigation (currently Math & English).
  - **Timer**: Server-synced `remaining_seconds`.
  - **Auto-save**: Progress saved to DB every few seconds or on answer change.
  - **Submission**: Calculates score server-side (`actions.ts`) and redirects.

### C. Results History (`src/app/exam/results/[attemptId]`)
- **Generic Page**: Can render results for ANY attempt (Trial or Paid).
- **Data**: Fetches `attempts` row + `questions` from DB.
- **Mapping**: Maps DB `type` ('math'/'eng') to UI sections ('Mathematics'/'English').

## 5. Key Server Actions (`src/app/exam/actions.ts`)
- `getAvailableExams(userId)`: Returns list of exams with `isLocked` status and `latestAttempt` info.
- `startExamAttempt(userId, examId)`: Core logic for creating/resuming attempts. Enforces permissions.
- `submitExam(attemptId, ...)`: Finalizes score and marks attempt `submitted`.

## 6. Design System
- **Aesthetics**: Premium, glassmorphism-inspired design.
- **CSS**: Uses `.module.css` files. Global vars in `globals.css` (primary colors, easy theming).
- **Responsiveness**: Mobile-first approach, adapting grids from 1 to 3 columns.
