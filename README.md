# Sema Na Boychild

NGO platform for boy-child mentorship & advocacy in Kenya.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Payments**: M-Pesa Daraja API, Stripe
- **Social**: TikTok, Instagram, YouTube, Facebook, Twitter auto-posting

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- Supabase CLI (`npm install -g supabase`)

### Setup

```bash
cd app
npm install

# Start local Supabase (requires Docker)
npx supabase start

# Start dev server
npm run dev
```

App runs at http://localhost:3000
Supabase Studio at http://127.0.0.1:54323

### Sample Login Credentials (Local Dev)

| Role        | Email                        | Password     |
|-------------|------------------------------|--------------|
| Admin       | admin@semanaboychild.org     | admin123456  |

To create additional test users, use the Supabase Studio at http://127.0.0.1:54323 or the Settings > Users page in the app.

## Features

- **Landing Page** — About, Programs, Testimonials, Contact, Donate
- **Boys Database** — Track mentored boys with progress notes and mentor assignments
- **Mentors** — Manage mentor profiles, assignments, and activity
- **Donations** — M-Pesa + Stripe integration, campaigns, receipts
- **Events & Seminars** — School visits, workshops, attendance tracking, media upload
- **Content Management** — Upload once, auto-post to TikTok, Instagram, YouTube, Facebook, Twitter with first comment
- **Finance Tracker** — All money through the system, expense approval workflow
- **Reports & Impact** — Aggregate impact metrics and exportable reports
- **Settings** — Org data, user management, roles, integrations

## Project Structure

```
app/                          # Next.js application
├── src/
│   ├── app/
│   │   ├── page.tsx          # Public landing page
│   │   ├── (auth)/login/     # Login
│   │   ├── (dashboard)/      # Admin pages (boys, mentors, donations, etc.)
│   │   └── api/              # API routes
│   ├── components/           # UI + layout components
│   ├── lib/supabase/         # Supabase client helpers
│   └── types/                # TypeScript types
├── supabase/migrations/      # Database schema + RLS policies
└── .env.local                # Environment variables
```

## Documentation

- [PRD.md](PRD.md) — Full Product Requirements Document
- [PROGRESS.md](PROGRESS.md) — Development progress tracker
