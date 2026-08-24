-- categories -> buckets dönüşümü, projects tablosu, Eisenhower matrisi.
-- Supabase SQL Editor'de çalıştırın. Mevcut veriyi korur (backfill sonra drop).

-- 1) categories -> buckets (isim, veri, RLS hepsi aynı tabloyla birlikte taşınır)
alter table categories rename to buckets;
drop policy if exists "categories_all" on buckets;
create policy "buckets_all" on buckets for all using (true) with check (true);

-- 2) projects tablosu
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
alter table projects enable row level security;
drop policy if exists "projects_all" on projects;
create policy "projects_all" on projects for all using (true) with check (true);

-- 3) tasks: bucket_id/project_id ekle, eski category'den backfill et
alter table tasks add column if not exists bucket_id uuid references buckets(id) on delete set null;
alter table tasks add column if not exists project_id uuid references projects(id) on delete set null;

update tasks set bucket_id = buckets.id
from buckets
where tasks.category = buckets.name and tasks.bucket_id is null;

-- 4) Eisenhower matrisi: importance + urgency (eski tekli is_important yerine)
alter table tasks add column if not exists importance boolean not null default false;
alter table tasks add column if not exists urgency boolean not null default false;
update tasks set importance = true where is_important = true and importance = false;

-- 5) Artık gereksiz eski kolonları kaldır
-- (bucket_id kasıtlı olarak NOT NULL değil — eşleşmeyen eski veri migration'ı
-- kırmasın diye; uygulama katmanı her yeni görevde bucket_id zorunlu tutar)
alter table tasks drop column if exists category;
alter table tasks drop column if exists is_important;

create index if not exists tasks_bucket_idx on tasks (bucket_id);
create index if not exists tasks_project_idx on tasks (project_id);
create index if not exists projects_bucket_idx on projects (bucket_id);
