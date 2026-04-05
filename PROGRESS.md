# Sema Na Boychild - Development Progress

## Implementation Checklist

### Landing Page
- [x] Hero section with CTA buttons
- [x] Impact numbers with animated counters
- [x] About section (The Crisis, Our Approach, The Impact)
- [x] Programs section (Emotional Development, Leadership, Career)
- [x] Testimonials carousel
- [x] Donate section with M-Pesa STK Push integration
- [x] Contact section with form
- [x] Footer with social links
- [x] Smooth scrolling + scroll animations
- [x] Responsive nav with admin link
- [ ] Contact form client-side submission wired to API
- [ ] Blog / News section (inspired by amanmustcry.org)
- [ ] Vlog section — embedded YouTube videos
- [ ] Gallery / Media showcase from events
- [ ] Volunteer signup form
- [ ] Newsletter subscription with email collection
- [ ] Team / Leadership page
- [ ] Theory of Change / Our Approach detailed section
- [ ] Upcoming Events preview on homepage
- [ ] Featured Videos section on homepage
- [ ] Core Values section

### Authentication & Users
- [x] Supabase Auth login page
- [x] Session middleware with role-based redirects
- [x] User invite API (service role)
- [x] Role-based access: Admin, Coordinator, Mentor
- [x] RLS policies for all 23 tables
- [ ] Password reset flow
- [ ] Email verification
- [ ] OAuth social login (Google)

### Dashboard
- [x] KPI cards (Active Boys, Mentors, Donations, Events)
- [x] Quick actions panel
- [x] Recent activity feed
- [ ] Donation trend chart (Recharts)
- [ ] School visits map
- [ ] Campaign progress bars

### Boys Database
- [x] List with search and status filter
- [x] Add boy dialog form
- [x] Boy detail page with profile
- [x] Progress notes (add + view by category)
- [x] Mentor history tab
- [x] API routes (CRUD + notes)
- [ ] CSV/Excel export
- [ ] Bulk import
- [ ] Photo upload for boy profile

### Mentors
- [x] List with search
- [x] Add mentor dialog
- [x] Mentor detail page with assigned boys
- [x] Mentor assignment API
- [ ] Availability calendar
- [ ] Activity history

### Donations
- [x] Donation list with filters
- [x] Manual donation logging
- [x] Stats cards (total, this month, campaigns)
- [x] M-Pesa Daraja API (STK Push + callback)
- [x] Landing page donate button with phone input
- [x] Donation campaigns page with progress bars
- [ ] Stripe checkout integration
- [ ] PDF receipt generation
- [ ] Recurring donations
- [ ] Donor thank-you emails (Resend)

### Events & Seminars
- [x] Events list with type filter
- [x] Create event dialog
- [x] Event detail page (details, attendees, media, notes)
- [x] Status updates (planned -> ongoing -> completed)
- [x] Event notes
- [ ] Calendar view (month/week)
- [ ] Attendance marking
- [ ] Event media upload
- [ ] Budget vs actual tracking

### Content Management & Social Media
- [x] Create post page with rich editor
- [x] Media file upload (photos + videos) with Supabase Storage
- [x] Platform selection (Instagram, TikTok, YouTube, Facebook, Twitter)
- [x] First comment field with auto-post logic
- [x] Schedule or post immediately
- [x] Content list with status tabs and platform badges
- [x] **Facebook adapter** — Graph API v19, photo/video/text posts + comments
- [x] **Instagram adapter** — Graph API, single/carousel/reels + comments
- [x] **TikTok adapter** — Content Posting API v2, video upload + comments
- [x] **YouTube adapter** — Data API v3, resumable video upload + comment threads
- [x] **Twitter/X adapter** — API v2, tweet with media upload + reply comments
- [x] **Publishing engine** — Routes to all adapters, auto-refresh tokens, first comment automation
- [x] OAuth connect flow for all platforms (/api/social-accounts/connect/[platform])
- [x] OAuth callback handler (/api/social-accounts/callback/[platform])
- [x] Settings page connect buttons wired to OAuth
- [ ] Content scheduling cron job
- [ ] Content calendar view
- [ ] Media library browser
- [ ] Post analytics (likes, shares, reach)
- [ ] Retry failed posts

### Finance Tracker
- [x] Income/Expense/Balance overview cards
- [x] Expense logging with categories
- [x] Expense approval workflow (Admin approves)
- [ ] Financial reports (monthly/quarterly PDF)
- [ ] Receipt upload for expenses
- [ ] Budget allocation per event

### Reports & Impact
- [x] Aggregate impact stats page
- [ ] Charts (Recharts integration)
- [ ] Exportable PDF reports
- [ ] Custom date range filtering
- [ ] County-level school visits map

### Settings
- [x] Organization data management
- [x] User list and invite system
- [x] Social media account connections (OAuth)
- [x] Payment integration config display
- [ ] Role permissions matrix editor
- [ ] Landing page CMS (edit sections from admin)
- [ ] Email template management

### UI/UX
- [x] Forest green (#1B4332) theme throughout
- [x] Sidebar navigation with active states
- [x] Header with user avatar and dropdown
- [x] Scroll-triggered animations on landing page
- [x] Animated impact counters
- [x] Smooth scrolling
- [x] Hover effects on cards and buttons
- [x] shadcn/ui v4 component library
- [ ] Dark mode toggle
- [ ] Mobile responsive testing
- [ ] Loading skeletons
- [ ] Toast notifications on actions

### Infrastructure
- [x] Next.js 14 (App Router)
- [x] Supabase local (Docker) setup
- [x] Database migrations (3 files)
- [x] RLS policies
- [x] Storage bucket for media
- [x] TypeScript types for all tables
- [x] Environment variables template
- [ ] Vercel deployment config
- [ ] Supabase production setup
- [ ] CI/CD pipeline
- [ ] E2E tests (Playwright)

---

## Social Media Platform Setup Guide

To enable auto-posting, you need developer accounts on each platform:

### Facebook & Instagram
1. Go to https://developers.facebook.com
2. Create an App (Business type)
3. Add Facebook Login and Instagram Graph API products
4. Set redirect URI: `{APP_URL}/api/social-accounts/callback/facebook`
5. Get App ID and App Secret -> set `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`
6. For Instagram: Link an Instagram Business account to a Facebook Page

### TikTok
1. Go to https://developers.tiktok.com
2. Create an App
3. Enable Content Posting API and Login Kit
4. Set redirect URI: `{APP_URL}/api/social-accounts/callback/tiktok`
5. Get Client Key and Secret -> set `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`

### YouTube (Google)
1. Go to https://console.cloud.google.com
2. Create a project and enable YouTube Data API v3
3. Create OAuth 2.0 credentials (Web application)
4. Set redirect URI: `{APP_URL}/api/social-accounts/callback/youtube`
5. Get Client ID and Secret -> set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Twitter / X
1. Go to https://developer.twitter.com
2. Create a Project and App (OAuth 2.0)
3. Enable tweet.read, tweet.write, users.read, offline.access scopes
4. Set redirect URI: `{APP_URL}/api/social-accounts/callback/twitter`
5. Get Client ID and Secret -> set `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET`

---

## Android APK Generation Guide

The Sema Na Boychild web app can be packaged as an Android APK using multiple approaches:

### Option 1: TWA (Trusted Web Activity) — Recommended

TWA wraps your deployed web app in a native Android shell using Chrome Custom Tabs. No code changes needed.

**Prerequisites:**
- Web app deployed to HTTPS (e.g. Vercel)
- Android Studio installed
- Java JDK 11+

**Steps:**
1. **Install Bubblewrap CLI:**
   ```bash
   npm install -g @anthropic-ai/bubblewrap
   # or
   npm install -g @nicolo-ribaudo/bubblewrap
   ```

2. **Initialize TWA project:**
   ```bash
   mkdir sema-android && cd sema-android
   bubblewrap init --manifest https://your-deployed-url.vercel.app/manifest.json
   ```

3. **Add Web App Manifest** (create `app/public/manifest.json`):
   ```json
   {
     "name": "Sema Na Boychild",
     "short_name": "SemaNaBoychild",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#1B4332",
     "theme_color": "#1B4332",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }
   ```

4. **Build APK:**
   ```bash
   bubblewrap build
   ```

5. **Output:** `app-release-signed.apk` ready for Play Store or sideloading

### Option 2: Capacitor (Hybrid App)

Capacitor wraps the Next.js app with native Android/iOS shells, giving access to native APIs.

**Steps:**
1. **Install Capacitor:**
   ```bash
   cd app
   npm install @capacitor/core @capacitor/cli
   npx cap init "Sema Na Boychild" org.semanaboychild.app
   ```

2. **Configure for static export** — add to `next.config.mjs`:
   ```js
   const nextConfig = { output: 'export' };
   ```

3. **Build and sync:**
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   ```

4. **Open in Android Studio:**
   ```bash
   npx cap open android
   ```

5. **Build APK from Android Studio:**
   - Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`

6. **For signed release APK:**
   - Build > Generate Signed Bundle / APK
   - Create a keystore and sign the APK

### Option 3: PWA (Progressive Web App) — Simplest

No APK needed. Users install directly from the browser.

**Steps:**
1. Add `manifest.json` to `app/public/` (same as TWA above)
2. Add a service worker for offline support
3. Add meta tags to `layout.tsx`:
   ```tsx
   <link rel="manifest" href="/manifest.json" />
   <meta name="theme-color" content="#1B4332" />
   <meta name="apple-mobile-web-app-capable" content="yes" />
   ```
4. Users tap "Add to Home Screen" in Chrome to install

### Recommendation

- **For quick distribution:** Use PWA (Option 3) — no Play Store needed
- **For Play Store listing:** Use TWA (Option 1) — lightweight, auto-updates with web
- **For native features (camera, push notifications):** Use Capacitor (Option 2)

---

## Project Structure
```
app/
├── .env.local                    # Environment variables
├── supabase/migrations/
│   ├── 001_initial_schema.sql    # All 23 tables
│   ├── 002_rls_policies.sql     # Row Level Security
│   └── 003_storage_bucket.sql   # Media storage + social accounts
├── src/
│   ├── middleware.ts             # Auth middleware
│   ├── types/database.ts        # TypeScript DB types
│   ├── lib/
│   │   ├── supabase/            # Client, server, middleware
│   │   ├── social/              # Platform adapters
│   │   │   ├── engine.ts        # Publishing orchestrator
│   │   │   ├── facebook.ts      # Facebook Graph API
│   │   │   ├── instagram.ts     # Instagram Graph API
│   │   │   ├── tiktok.ts        # TikTok Content API
│   │   │   ├── youtube.ts       # YouTube Data API v3
│   │   │   └── twitter.ts       # Twitter API v2
│   │   └── storage/upload.ts    # Supabase Storage upload
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   ├── layout/              # Sidebar, Header
│   │   └── landing/             # DonateSection, ScrollAnimate, CounterAnimate
│   └── app/
│       ├── page.tsx             # Public landing page
│       ├── (auth)/login/
│       ├── (dashboard)/         # Admin pages
│       └── api/                 # API routes
│           ├── social-accounts/ # OAuth connect + callback
│           ├── content/[id]/    # Publish + comment
│           └── payments/        # M-Pesa + Stripe
```

---

## Build Status
- Build: PASSING
- Local Supabase: CONFIGURED (Docker)
- Social Media: ADAPTERS COMPLETE (need platform API keys to activate)
