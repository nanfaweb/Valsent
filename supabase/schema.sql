-- -- Enable UUID extension (if not already enabled)
-- create extension if not exists "uuid-ossp";

-- -- PLANS TABLE
-- create table if not exists public.plans (
--   id uuid default uuid_generate_v4() primary key,
--   name text not null,
--   price_pkr integer not null,
--   original_price_pkr integer not null,
--   features jsonb not null default '[]'::jsonb,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- PURCHASES TABLE
-- create table if not exists public.purchases (
--   id uuid default uuid_generate_v4() primary key,
--   user_id uuid references auth.users not null,
--   plan_id uuid references public.plans not null,
--   status text check (status in ('pending', 'active', 'failed')) not null default 'pending',
--   paypro_order_id text,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- MOCK EXAMS TABLE
-- create table if not exists public.mocks (
--   id uuid default uuid_generate_v4() primary key,
--   title text not null,
--   description text,
--   duration_minutes integer not null,
--   total_questions integer not null default 0,
--   difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'medium',
--   is_trial boolean default false,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- QUESTIONS TABLE
-- create table if not exists public.questions (
--   id uuid default uuid_generate_v4() primary key,
--   mock_id uuid references public.mocks not null,
--   type text check (type in ('mcq', 'text')) not null default 'mcq',
--   question_text text not null,
--   choices jsonb default '[]'::jsonb,
--   correct_answer text not null,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- TRIAL ATTEMPTS TABLE (NEW)
-- create table if not exists public.trial_attempts (
--   id uuid default uuid_generate_v4() primary key,
--   user_id uuid references auth.users not null,
--   mock_id uuid references public.mocks not null,
--   score integer not null,
--   total_questions integer not null,
--   time_taken_seconds integer not null,
--   percentile integer,
--   answers jsonb default '{}'::jsonb,
--   completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- ATTEMPTS TABLE (for paid users)
-- create table if not exists public.attempts (
--   id uuid default uuid_generate_v4() primary key,
--   user_id uuid references auth.users not null,
--   mock_id uuid references public.mocks not null,
--   score integer,
--   answers jsonb default '{}'::jsonb,
--   started_at timestamp with time zone default timezone('utc'::text, now()) not null,
--   finished_at timestamp with time zone,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- TESTIMONIALS TABLE
-- create table if not exists public.testimonials (
--   id uuid default uuid_generate_v4() primary key,
--   name text not null,
--   text text not null,
--   avatar_url text,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- -- RLS POLICIES

-- -- Plans: Public read
-- alter table public.plans enable row level security;
-- drop policy if exists "Plans are viewable by everyone" on public.plans;
-- create policy "Plans are viewable by everyone" on public.plans for select using (true);

-- -- Testimonials: Public read
-- alter table public.testimonials enable row level security;
-- drop policy if exists "Testimonials are viewable by everyone" on public.testimonials;
-- create policy "Testimonials are viewable by everyone" on public.testimonials for select using (true);

-- -- Mocks: Public metadata
-- alter table public.mocks enable row level security;
-- drop policy if exists "Mocks metadata viewable by everyone" on public.mocks;
-- create policy "Mocks metadata viewable by everyone" on public.mocks for select using (true);

-- -- Questions: Accessible based on trial or purchase
-- alter table public.questions enable row level security;
-- drop policy if exists "Questions viewable by trial or active subscribers" on public.questions;
-- create policy "Questions viewable by trial or active subscribers" on public.questions for select using (
--   exists (
--     select 1 from public.mocks m
--     where m.id = mock_id and m.is_trial = true
--   )
--   or exists (
--     select 1 from public.purchases
--     where user_id = auth.uid() and status = 'active'
--   )
-- );

-- -- Purchases: Users see their own
-- alter table public.purchases enable row level security;
-- drop policy if exists "Users can view own purchases" on public.purchases;
-- create policy "Users can view own purchases" on public.purchases for select using (auth.uid() = user_id);

-- -- Trial Attempts: Users see and insert their own
-- alter table public.trial_attempts enable row level security;
-- drop policy if exists "Users can view own trial attempts" on public.trial_attempts;
-- drop policy if exists "Users can insert own trial attempts" on public.trial_attempts;
-- create policy "Users can view own trial attempts" on public.trial_attempts for select using (auth.uid() = user_id);
-- create policy "Users can insert own trial attempts" on public.trial_attempts for insert with check (auth.uid() = user_id);

-- -- Attempts: Users see and manage their own
-- alter table public.attempts enable row level security;
-- drop policy if exists "Users can view own attempts" on public.attempts;
-- drop policy if exists "Users can insert own attempts" on public.attempts;
-- drop policy if exists "Users can update own attempts" on public.attempts;
-- create policy "Users can view own attempts" on public.attempts for select using (auth.uid() = user_id);
-- create policy "Users can insert own attempts" on public.attempts for insert with check (auth.uid() = user_id);
-- create policy "Users can update own attempts" on public.attempts for update using (auth.uid() = user_id);
