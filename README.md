# Valsent

SaaS platform for **university entry-test prep** (BBA and BCS). Students take timed mock exams that mirror real conditions, get score analytics, and unlock a full mock bank with a one-time access pass.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Auth + Postgres) · CSS Modules

## Features

- Email/password and Google sign-in
- BBA vs BCS tracks — exams filtered by discipline
- Free trial mock, then paid lifetime unlock for that track
- Timed MCQ player with Math / English sections, pause, resume, and DB autosave
- Results history and dashboard stats
- Manual payment (EasyPaisa / bank) + WhatsApp notify; admin grants access

## Repo layout

```
VALSENT-PROJECT/
├── bba_papers/          # BBA question banks (JSON)
├── bcs_papers/          # BCS question banks (JSON)
└── valsent/             # Next.js app
    ├── scripts/         # Helpers to turn paper JSON into SQL
    ├── supabase/        # Schema / migration SQL
    └── src/
        ├── app/         # Pages, API routes, exam server actions
        ├── components/  # UI, landing, dashboard, exam player
        ├── context/     # Auth provider
        └── utils/       # Supabase client / middleware helpers
```

Run the app from `valsent/` (`npm install` → `npm run dev`).

## Core logic

**Access:** trial available → trial used (mocks locked) → purchase active (full track + retakes).

**Exam:** browse → rules → timed player → results. Locks and scoring are enforced server-side (`src/app/exam/actions.ts`).

**Payment:** user pays offline → WhatsApp notification → admin activates purchase → full access.

**Auth guard:** middleware protects dashboard / exams / payment / admin. Users without a discipline are sent to onboarding. Admin UI is limited to a configured admin email.

## Main surfaces

| Area | Paths |
| --- | --- |
| Public | `/`, `/pricing`, `/auth/*` |
| Student | `/dashboard`, `/exams`, `/exam/[id]`, `/results`, `/payment`, `/account` |
| Admin | `/admin` (stats, user search, grant access), `/admin/seed` |

## Data (Supabase)

| Table | Purpose |
| --- | --- |
| `profiles` | Discipline, trial status |
| `plans` / `purchases` | Pricing and access grants |
| `mocks` / `questions` | Exam definitions and MCQs |
| `attempts` | In-progress and submitted runs (answers, timer, sections) |

Question banks live as JSON under `bba_papers/` and `bcs_papers/`; `scripts/` can generate SQL to load them into Supabase.

## More detail

See [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) for exam workflow and schema notes.
