-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PLANS TABLE
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price_pkr integer not null,
  original_price_pkr integer not null,
  features jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PURCHASES TABLE
create table public.purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  plan_id uuid references public.plans not null,
  status text check (status in ('pending', 'active', 'failed')) not null default 'pending',
  paypro_order_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MOCK EXAMS TABLE
create table public.mocks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  duration_minutes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUESTIONS TABLE
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  mock_id uuid references public.mocks not null,
  type text check (type in ('mcq', 'text')) not null default 'mcq',
  question_text text not null,
  choices jsonb default '[]'::jsonb, -- Array of strings for MCQs
  correct_answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ATTEMPTS TABLE
create table public.attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  mock_id uuid references public.mocks not null,
  score integer,
  answers jsonb default '{}'::jsonb, -- Key-value pair of question_id: answer
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  finished_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TESTIMONIALS TABLE
create table public.testimonials (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  text text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES

-- Plans: Public read
alter table public.plans enable row level security;
create policy "Plans are viewable by everyone" on public.plans for select using (true);

-- Testimonials: Public read
alter table public.testimonials enable row level security;
create policy "Testimonials are viewable by everyone" on public.testimonials for select using (true);

-- Services (Mocks/Questions): specific logic needed.
-- Ideally visible only if purchased, but for now we can make metadata public or check purchase.
-- Let's assume metadata is public, content needs purchase check (handled in API/App logic mostly, but RLS can enforce).
-- For simplicity in this step:
alter table public.mocks enable row level security;
create policy "Mocks metadata viewable by everyone" on public.mocks for select using (true);

alter table public.questions enable row level security;
create policy "Questions viewable by active subscribers" on public.questions for select using (
  exists (
    select 1 from public.purchases
    where user_id = auth.uid()
    and status = 'active'
    -- Simplified: any active purchase unlocks all questions. 
    -- If questions belong to a mock, we could join, but let's keep it simple.
  )
);

-- Purchases: Users see their own
alter table public.purchases enable row level security;
create policy "Users can view own purchases" on public.purchases for select using (auth.uid() = user_id);

-- Attempts: Users see and insert their own
alter table public.attempts enable row level security;
create policy "Users can view own attempts" on public.attempts for select using (auth.uid() = user_id);
create policy "Users can insert own attempts" on public.attempts for insert with check (auth.uid() = user_id);
create policy "Users can update own attempts" on public.attempts for update using (auth.uid() = user_id);
