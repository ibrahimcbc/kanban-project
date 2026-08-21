# Kişisel Gelişim Dashboard

## Amaç
Tek kullanıcılı, üç cihazda (Mac/iPhone/iPad) senkronize çalışan bir web
uygulaması. Kanban tabanlı task yönetimi + GitHub ve Strava aktivitesinin
otomatik gösterimi. İnternet olmadan çalışmasına gerek yok (PWA, offline-first
değil).

## Kullanıcı
Tek kişi (proje sahibi). Multi-user, auth sistemi, paylaşım özelliği YOK.
Basit bir "owner-only" erişim yeterli — Supabase'de tek satırlık bir
`ADMIN_SECRET` env değişkeniyle bile korunabilir, karmaşık auth kurma.

## Tech Stack
- **Framework:** Next.js 14+ (App Router), TypeScript
- **Styling:** Tailwind CSS
- **DB:** Supabase (Postgres) — free tier
- **Hosting:** Vercel — free tier (Hobby plan)
- **Cron:** Vercel Cron (günde 1 kez GitHub + Strava verisi çeker)
- **PWA:** manifest.json + basit service worker (yalnızca "ana ekrana ekle"
  için, offline cache gerekmiyor)

## Tasarım Kararları (neden böyle)
- Notion/native app değil, web app: sync sorunu sunucu tarafında otomatik
  çözülüyor, tek kod tabanı üç cihazda çalışıyor.
- Drag-and-drop VAR — kullanıcı deneyimlemek istiyor. `@dnd-kit/core` ile
  yapılacak (React için en stabil, erişilebilir kütüphane). "Sonraki kolona
  taşı" butonu da yedek/erişilebilirlik seçeneği olarak yanında dursun —
  mobil dokunmatikte sürükleme bazen can sıkıcı olabiliyor.
- Kanban 3 kolonla başlıyor, gerekirse sonra bölünür:
  `Yapılacak → Yapılıyor → Tamamlandı`
  (Kullanıcının orijinal taslağındaki "Yeni tasklar / Planlananlar" ayrımı
  pratikte tek kişilik kullanımda karışıyor, bu yüzden birleştirildi — ihtiyaç
  hissedilirse v2'de tekrar ayrılabilir.)
- Dış API çağrıları (Strava/GitHub) her sayfa yüklemesinde DEĞİL, günde bir
  cron job ile yapılıp DB'ye cache'lenecek. Rate limit ve yavaşlık riski bu
  şekilde önleniyor.

## Veritabanı Şeması (v0 + v1 birlikte, ileri görüşlü tasarlandı)

```sql
-- Kanban kartları
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null, -- 'günlük', 'spor', 'kodlama', 'fikirler' vs.
  status text not null default 'yapilacak', -- 'yapilacak' | 'yapiliyor' | 'tamamlandi'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Kategoriler (kullanıcı yeni kategori ekleyebilsin diye ayrı tablo)
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text -- hex renk kodu, kanban'da kart rengini belirler
);

-- GitHub günlük snapshot (cron ile doldurulur)
create table github_activity (
  date date primary key,
  contribution_count int not null default 0
);

-- Strava aktivite cache (cron ile doldurulur)
create table strava_activities (
  id text primary key, -- Strava activity id
  type text,           -- 'Run', 'Ride' vs.
  name text,
  distance_m numeric,
  moving_time_s int,
  start_date timestamptz
);

-- OAuth token'ları saklamak için (Strava refresh token vs.)
create table integration_tokens (
  provider text primary key, -- 'strava' | 'github'
  access_token text,
  refresh_token text,
  expires_at timestamptz
);
```

## Yol Haritası

### Hafta 1 — v0 (İSKELET, dış entegrasyon YOK)
- [ ] Next.js proje kurulumu, Supabase bağlantısı
- [ ] `tasks` ve `categories` tabloları
- [ ] Kanban board UI: 3 kolon, kart ekleme/silme
- [ ] Drag-and-drop ile kolonlar arası taşıma (`@dnd-kit/core`), yedek olarak
      "sonraki kolona taşı" butonu da eklensin
- [ ] Kategoriye göre filtreleme
- [ ] Vercel'e deploy
- [ ] PWA manifest — üç cihaza "ana ekrana ekle"
- [ ] **1 hafta gerçekten kullan, sonra devam et**

### Hafta 2 — v1 (Entegrasyonlar)
- [ ] GitHub GraphQL API bağlantısı, contribution grid komponenti
- [ ] Strava OAuth akışı + refresh token yönetimi
- [ ] Vercel Cron: günde 1 kez `github_activity` ve `strava_activities`
      tablolarını doldur
- [ ] Dashboard'da GitHub grid + Strava özet kartı

### Hafta 3 — v2 (Genişleme)
- [ ] Alışkanlık takibi (kitap okuma, staj başvurusu vb. — kullanıcının
      taslağındaki yıldızlı maddeler)
- [ ] "Fikirler" serbest not/inbox alanı
- [ ] Görsel/UX iyileştirme

## Claude Code için notlar
- Her oturuma bu dosyayı okuyarak başla.
- Bir fazı bitirmeden bir sonrakine geçme (özellikle Hafta 1 → Hafta 2 arası
  gerçek kullanım testi atlanmamalı).
- Yeni bağımlılık eklemeden önce "gerçekten gerekli mi" diye sor — proje
  bilinçli olarak minimal tutuluyor.
- **Güvenlik:** `integration_tokens` tablosunda Strava/GitHub secret'ları düz
  metin tutuluyor. Supabase'de Row Level Security (RLS) MUTLAKA açılmalı,
  aksi halde tablo public API üzerinden herkese açık okunabilir hale gelir.
  Hafta 2'de bu tabloyu oluştururken RLS policy'sini de aynı anda yaz, sonraya
  bırakma.
