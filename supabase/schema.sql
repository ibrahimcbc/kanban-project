-- Kişisel Gelişim Dashboard — şema (buckets/projects + Eisenhower + Google Calendar senkronu)
-- Supabase SQL Editor'de çalıştırılacak.
-- github_activity / strava_activities tabloları Hafta 2'de eklenecek (bkz. PROJECT.md).

create extension if not exists "pgcrypto";

-- Hayat alanları (iş, spor, kodlama, fikirler vb.) — eski adıyla "categories".
create table if not exists buckets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bucket_id uuid references buckets(id) on delete set null,
  status text not null default 'ongoing'
    check (status in ('ongoing', 'deadline', 'favorite', 'finished', 'archived')),
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bucket_id uuid references buckets(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  status text not null default 'yapilacak'
    check (status in ('yapilacak', 'yapiliyor', 'tamamlandi')),
  notes text,
  deadline date,
  -- Eisenhower matrisi
  importance boolean not null default false,
  urgency boolean not null default false,
  start_time timestamptz,
  end_time timestamptz,
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_status_idx on tasks (status);
create index if not exists tasks_bucket_idx on tasks (bucket_id);
create index if not exists tasks_project_idx on tasks (project_id);
create index if not exists projects_bucket_idx on projects (bucket_id);

-- OAuth token'ları (Google Calendar, ileride Strava/GitHub). RLS açık ve
-- kasıtlı olarak HİÇ policy yok — anon key ile erişilemez, sadece server-only
-- service role key ile (bkz. src/lib/supabaseAdmin.ts).
create table if not exists integration_tokens (
  provider text primary key,
  access_token text,
  refresh_token text,
  expires_at timestamptz
);
alter table integration_tokens enable row level security;

-- Tek kullanıcılı proje: diğer tablolarda RLS'i basit tutuyoruz, anon key
-- sadece bu projeye özel ve public'e paylaşılmayacak.
alter table buckets enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

drop policy if exists "buckets_all" on buckets;
create policy "buckets_all" on buckets for all using (true) with check (true);

drop policy if exists "projects_all" on projects;
create policy "projects_all" on projects for all using (true) with check (true);

drop policy if exists "tasks_all" on tasks;
create policy "tasks_all" on tasks for all using (true) with check (true);

-- Başlangıç bucket'ları
insert into buckets (name, color) values
  ('günlük', '#6366f1'),
  ('spor', '#22c55e'),
  ('kodlama', '#3b82f6'),
  ('fikirler', '#f59e0b')
on conflict (name) do nothing;
