# Valsent - University Entry Test Prep Platform

A production-ready SaaS platform for university entry test preparation built with Next.js, Supabase, and PayPro integration.

## Features

- **Public Landing Page**: Conversion-optimized hero, features, pricing, and testimonials.
- **Authentication**: Email/Password and Google OAuth via Supabase.
- **Payment Integration**: PayPro hosted checkout integration for subscription management.
- **Dashboard**: Authenticated user area with access control.
- **Mock Exam System**: Timed exam player with autosave and score tracking.
- **Admin Tools**: Seeding script to populate exams and questions.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, CSS Modules (No Tailwind).
- **Backend/Database**: Supabase (PostgreSQL, Auth, RLS).
- **Styling**: Plain CSS with CSS Variables for theming.
- **Payment**: PayPro Mock Integration.

## Getting Started

### 1. Prerequisites

- Node.js 18+
- Supabase Project

### 2. Installation

```bash
npm install
```

### 3. Environment Variables

Create `.env.local` in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment (Mock/PayPro)
PAYPRO_API_KEY=mock_key
PAYPRO_API_SECRET=mock_secret
PAYPRO_WEBHOOK_SECRET=mock_webhook_secret

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Setup

1. Go to your Supabase Dashboard -> SQL Editor.
2. Run the contents of `supabase/schema.sql`.
3. This creates tables (`users`, `plans`, `purchases`, `mocks`, `questions`, `attempts`, `testimonials`) and enables RLS.

### 5. Seeding Data

To populate the database with a sample Plan, Mock Exam, and Questions:

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/admin/seed`
3. Click "Run Seed Script".

### 6. Running Application

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Deployment

### Vercel Deployment (Recommended)

1. Push code to GitHub.
2. Import project in Vercel.
3. Add the Environment Variables from `.env.local` to Vercel Project Settings.
4. Deploy.

### AWS Free Tier Deployment (EC2/Amplify)

**Option A: AWS Amplify (Easiest)**
1. Connect GitHub repo to AWS Amplify Console.
2. Add Environment Variables in Build Settings.
3. Deploy. (Amplify supports Next.js SSR).

**Option B: EC2 (Manual)**
1. Launch t2.micro instance (Free Tier).
2. Install Node.js and PM2.
3. Clone repo and run `npm install` & `npm run build`.
4. Start with PM2: `pm2 start npm --name valsent -- start`.
5. Configure Nginx as reverse proxy to port 3000.

## Project Structure

- `src/app`: App Router pages and API routes.
- `src/components`: UI (`ui/`) and Feature (`features/`) components.
- `src/lib`: Utility functions and Supabase client.
- `src/context`: React Context providers (Auth).
- `src/styles`: Global CSS.

## Testing / Verification Guide

1. **Sign Up**: Create a new account. You should be redirected to Dashboard.
2. **Dashboard**: Verify "Free Account" status and locked exams.
3. **Upgrade**: Click "Upgrade Now". It will simulate a checkout.
   - For dev, the mock API returns a success URL immediately.
   - In production, it redirects to PayPro.
4. **Webhook**: The mock checkout flow simulates success. If testing manually, POST to `/api/webhooks/paypro`.
5. **Take Exam**: Once upgraded, exams unlock. Click "Start Exam".
   - Verify timer counts down.
   - Verify answers save to LocalStorage (refresh page to test).
   - Submit and check Score Result.
