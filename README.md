# Kişisel Gelişim Dashboard

Proje kapsamı ve yol haritası için [PROJECT.md](./PROJECT.md) dosyasına bakın.

## Kurulum (Hafta 1)

1. **Supabase projesi oluşturun**: [supabase.com](https://supabase.com) üzerinde
   yeni bir proje açın (free tier yeterli).
2. **Şemayı çalıştırın**: Supabase Dashboard → SQL Editor içine
   [`supabase/schema.sql`](./supabase/schema.sql) dosyasının içeriğini yapıştırıp
   çalıştırın. Bu, `tasks` ve `categories` tablolarını, RLS policy'lerini ve
   başlangıç kategorilerini oluşturur.
3. **Env değişkenlerini ayarlayın**: `.env.local.example` dosyasını
   `.env.local` olarak kopyalayın ve Supabase Dashboard → Project Settings →
   API bölümünden aldığınız `Project URL` ve `anon public` key'i girin.

   ```bash
   cp .env.local.example .env.local
   ```

4. **Geliştirme sunucusunu başlatın**:

   ```bash
   npm install
   npm run dev
   ```

   [http://localhost:3000](http://localhost:3000) adresini açın.

## Vercel'e Deploy

```bash
npx vercel
```

Vercel Dashboard'da proje ayarlarına, `.env.local` içindeki iki değişkeni
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) Environment
Variables olarak eklemeyi unutmayın — aksi halde production build Supabase'e
bağlanamaz.

## PWA — Ana Ekrana Ekleme

`public/manifest.json` ve `public/sw.js` ile temel PWA desteği var (offline
cache yok, sadece "ana ekrana ekle" için). Deploy sonrası Mac/iPhone/iPad'de
tarayıcı menüsünden "Ana Ekrana Ekle" ile kurulabilir.

## Tech Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Supabase · @dnd-kit ·
Vercel
