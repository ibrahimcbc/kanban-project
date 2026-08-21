-- Görev detay sayfası için: uzun not alanı, deadline ve önem etiketi.
-- Supabase SQL Editor'de çalıştırın (mevcut tasks tablosunu değiştirir).

alter table tasks
  add column if not exists notes text,
  add column if not exists deadline date,
  add column if not exists is_important boolean not null default false;

-- UI yenilemesiyle birlikte kategori renklerini biraz canlandıralım (kozmetik).
update categories set color = '#6366f1' where name = 'günlük' and color = '#64748b';
update categories set color = '#f59e0b' where name = 'fikirler' and color = '#eab308';
