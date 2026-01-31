-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles: one per auth user, extended with notification settings
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  email_notifications boolean not null default true,
  notification_frequency text not null default 'instant' check (notification_frequency in ('instant', 'daily_digest')),
  last_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User search keywords (e.g. "Asfalt")
create table public.user_keywords (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  keyword text not null,
  created_at timestamptz not null default now(),
  unique(user_id, keyword)
);

-- Alerts: one row per user per matched tender (triggered for email; also shown on dashboard)
create table public.alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tender_title text not null,
  tender_organization text not null,
  tender_location text,
  tender_deadline text,
  tender_url text,
  tender_category text,
  matched_keyword text not null,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_user_keywords_user_id on public.user_keywords(user_id);
create index idx_alerts_user_id on public.alerts(user_id);
create index idx_alerts_created_at on public.alerts(created_at desc);

-- RLS: users can only read/write their own data
alter table public.profiles enable row level security;
alter table public.user_keywords enable row level security;
alter table public.alerts enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own keywords"
  on public.user_keywords for all
  using (auth.uid() = user_id);

create policy "Users can view own alerts"
  on public.alerts for select
  using (auth.uid() = user_id);

-- Service role / Edge Functions need to insert alerts (scraper) and read profiles (email)
-- So we allow insert on alerts from service role; for RLS we need a policy that allows
-- the backend to insert. Actually: scraper will use service_role which bypasses RLS.
-- So we only need policies for the frontend (auth.uid()).

-- Trigger: create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();