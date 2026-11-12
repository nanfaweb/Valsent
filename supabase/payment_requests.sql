-- Manual payment requests (EasyPaisa / JazzCash / bank).
-- Run once in the Supabase SQL editor.
--
-- Flow: student pays -> submits the transaction ID on /payment -> row is created
-- here as 'pending' -> admin verifies it in the wallet app -> approves in /admin
-- -> a normal row is inserted into public.purchases.

create table if not exists public.payment_requests (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users(id) on delete cascade,
    discipline    text not null check (discipline in ('bba', 'bcs')),
    method        text not null check (method in ('easypaisa', 'jazzcash', 'bank')),
    txn_id        text not null,
    sender_number text not null,
    amount_pkr    integer not null,
    status        text not null default 'pending'
                  check (status in ('pending', 'approved', 'rejected')),
    admin_note    text,
    created_at    timestamptz not null default now(),
    reviewed_at   timestamptz
);

-- A transaction ID can only ever be submitted once per method.
create unique index if not exists payment_requests_method_txn_key
    on public.payment_requests (method, txn_id);

create index if not exists payment_requests_status_created_idx
    on public.payment_requests (status, created_at desc);

create index if not exists payment_requests_user_idx
    on public.payment_requests (user_id);

alter table public.payment_requests enable row level security;

-- Students may only READ their own requests (to show "pending" on /payment).
-- There is deliberately no insert/update/delete policy: all writes go through
-- server actions that use the service role after checking the signed-in user.
drop policy if exists "Users can view own payment requests" on public.payment_requests;
create policy "Users can view own payment requests"
    on public.payment_requests for select
    using (auth.uid() = user_id);
