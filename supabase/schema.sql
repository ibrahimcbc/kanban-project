-- Kişisel Gelişim Dashboard — şema (v0 + Google Calendar senkronu)
-- Supabase SQL Editor'de çalıştırılacak.
-- github_activity / strava_activities tabloları Hafta 2'de eklenecek (bkz. PROJECT.md).

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  status text not null default 'yapilacak'
    check (status in ('yapilacak', 'yapiliyor', 'tamamlandi')),
  notes text,
  deadline date,
  is_important boolean not null default false,
  start_time timestamptz,
  end_time timestamptz,
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_status_idx on tasks (status);
create index if not exists tasks_category_idx on tasks (category);

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

-- Tek kullanıcılı proje: tasks/categories için RLS'i basit tutuyoruz, anon
-- key sadece bu projeye özel ve public'e paylaşılmayacak.
alter table categories enable row level security;
alter table tasks enable row level security;

drop policy if exists "categories_all" on categories;
create policy "categories_all" on categories for all using (true) with check (true);

drop policy if exists "tasks_all" on tasks;
create policy "tasks_all" on tasks for all using (true) with check (true);

-- Başlangıç kategorileri
insert into categories (name, color) values
  ('günlük', '#6366f1'),
  ('spor', '#22c55e'),
  ('kodlama', '#3b82f6'),
  ('fikirler', '#f59e0b')
on conflict (name) do nothing;
