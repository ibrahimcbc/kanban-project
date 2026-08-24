-- Görevlere başlangıç/bitiş saati ve Google Calendar senkronizasyonu.
-- Supabase SQL Editor'de çalıştırın.

alter table tasks
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists google_event_id text;

-- OAuth token'ları (Google Calendar, ileride Strava/GitHub — bkz. PROJECT.md).
-- KRİTİK: Bu tablo hiçbir policy tanımlamadan sadece RLS'i açık bırakıyor,
-- yani anon key (client tarafında herkese açık) ile HİÇBİR satır okunamaz/
-- yazılamaz. Sadece Supabase service role key (server-only, .env'de
-- NEXT_PUBLIC_ öneki YOK) ile erişilebilir — bu key RLS'i bypass eder.
create table if not exists integration_tokens (
  provider text primary key,
  access_token text,
  refresh_token text,
  expires_at timestamptz
);

alter table integration_tokens enable row level security;
-- Kasıtlı olarak hiç policy yok — varsayılan davranış: anon/authenticated
-- rolleri için tüm erişim reddedilir, sadece service role erişebilir.
