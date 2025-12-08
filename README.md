# Çiftlik360

Çiftlik yönetimi için geliştirdiğim web uygulaması. Hayvanlarınızı takip edin, yem stoklarınızı yönetin, gelir-gider kayıtlarınızı tutun.

## Neler Var?

**Hayvan Takibi**
- Hayvan kayıt sistemi (küpe no, tür, ırk, cinsiyet)
- Alış/satış işlemleri
- Durum takibi (aktif, satıldı, hasta, gebe)
- Excel/PDF export

**Envanter**
- Yem stok yönetimi
- Tedarikçi bilgileri
- Son kullanma tarihi takibi

**Finans**
- Gelir/gider kayıtları
- Otomatik işlem kayıtları (hayvan alım/satım)
- Aylık grafikler

**Ayarlar**
- Profil bilgileri
- Çiftlik detayları (alan, kapasite, vb.)

**Güvenlik**
- Supabase auth
- CSRF koruması
- Güvenli oturum yönetimi

## Teknolojiler

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn UI

**Backend**
- Supabase (PostgreSQL, Auth, RLS)

**Diğer**
- React Hook Form + Zod
- Recharts
- next-themes (dark mode)

## Kurulum

```bash
git clone https://github.com/yourusername/ciftlik360web.git
cd ciftlik360web
npm install
```

`.env.local` dosyası oluştur:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

Supabase'de `database.md` dosyasındaki SQL'i çalıştır.

```bash
npm run dev
```

http://localhost:3000

## Klasör Yapısı

```
app/
├── (auth)/           # login, signup
├── (dashboard)/      # ana sayfalar
│   ├── animals/
│   ├── inventory/
│   ├── finance/
│   └── settings/
└── api/auth/logout/

components/
├── animals/
├── settings/
├── shared/
└── ui/              # shadcn

lib/
├── supabase/
├── csrf.ts
├── session.ts
└── types.ts
```

## Güvenlik

- HTTP-only cookies
- CSRF token
- CSP headers
- Oturum timeout (1 saat)
- RLS ile veri izolasyonu

## Veritabanı

- `users` - kullanıcılar
- `animals` - hayvanlar
- `feed_inventory` - yem stoku
- `transactions` - gelir/gider
- `farm_info` - çiftlik bilgileri

