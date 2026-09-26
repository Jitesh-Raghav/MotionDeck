-- Waitlist signups from the landing page.
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  source text check (source in ('hero', 'final-cta')),
  created_at timestamptz not null default now()
);

-- RLS on with no policies: the anon and authenticated roles can't read or
-- write. Only the server (service role key) can insert.
alter table public.waitlist enable row level security;
