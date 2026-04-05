# Sema Na Boychild

### NGO Platform for Boy-Child Mentorship & Advocacy

---

Software Scope - Product Requirements Document - Orchestrator Tasklist

Version 1.0 - Created for Claude Code Orchestrator

Sema Na Boychild - Nairobi, Kenya - 2026 - Social Impact / NGO

---

## 1. Executive Summary

Sema Na Boychild is a full-stack NGO platform built to address the crisis facing young men in Kenya. Boys are falling behind — academically, emotionally, and socially — while societal focus has shifted disproportionately toward the girl-child. This platform serves as the digital backbone for the NGO's operations: a public-facing landing page for awareness, a donation pipeline to fund school visits and seminars, a mentee/mentor tracking system, event management, and an automated content management system that handles social media posting across TikTok, Instagram, YouTube, Facebook, and Twitter.

**Core USP:** An integrated NGO operations platform where all donations flow through the system with full transparency, all events and school visits are tracked and documented, and content is uploaded once and auto-distributed across all social channels with automated first comments — a single source of truth for the organization's impact and outreach.

---

## 2. Tech Stack & Infrastructure

### 2.1 Frontend

| Component | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, RSC, API Routes, SEO optimization |
| UI Library | shadcn/ui + Tailwind CSS | Production-grade components, rapid development |
| State Management | Zustand + React Query (TanStack) | Global state + server-state caching |
| Charts | Recharts | Donation tracking, impact metrics visualization |
| Forms | React Hook Form + Zod | Type-safe form validation (donations, contact, events) |
| Icons | Lucide React | Consistent icon system |
| Animations | Framer Motion | Smooth page transitions, scroll animations |
| Rich Text Editor | Tiptap | Content creation for social media posts |

### 2.2 Backend & Database

| Component | Technology | Rationale |
|---|---|---|
| Database | Supabase (PostgreSQL) | RLS, Realtime, Auth, Storage — all in one |
| Auth | Supabase Auth | Email/password, roles (Admin, Coordinator, Mentor) |
| File Storage | Supabase Storage | Event photos, seminar documentation, content media |
| API | Next.js API Routes (RESTful) | Integrated API, no separate server needed |
| Payments | M-Pesa (Daraja API) + Stripe | M-Pesa for Kenya, Stripe for international donors |
| Social Media Posting | Custom integration via platform APIs | TikTok, Instagram, YouTube, Facebook, Twitter |
| Email | Resend | Donation receipts, event notifications, newsletters |
| Deployment | Vercel (Frontend) + Supabase Cloud | Zero-config, auto-deploy |

---

## 3. Module Overview

The platform consists of 2 main surfaces: **Landing Page** (public) and **Admin App** (internal), with 10 core modules navigated via a left sidebar in the admin app.

| # | Module | Description | Priority |
|---|---|---|---|
| 01 | Landing Page | Public-facing site: About, Programs, Testimonials, Contact, Donate | P0 |
| 02 | Dashboard | KPIs, donation overview, upcoming events, recent activity | P0 |
| 03 | Boys Database | Track mentored boys: schools, progress, notes, outcomes | P0 |
| 04 | Mentors | Mentor profiles, assignments, availability, activity history | P0 |
| 05 | Donations | All donations tracked, M-Pesa/Stripe integration, receipts | P0 |
| 06 | Events & Seminars | School visits, seminars, event planning, documentation | P0 |
| 07 | Content Management | Upload content, auto-post to social media, first comment automation | P0 |
| 08 | Finance Tracker | All money flows through the system, expense tracking, reports | P1 |
| 09 | Reports & Impact | Impact reports, analytics, exportable summaries | P1 |
| 10 | Settings | Organization data, users, roles, API keys, integrations | P0 |

---

## 4. Database Schema (Supabase / PostgreSQL)

Complete relational schema with Row Level Security (RLS). All tables have `created_at`, `updated_at`, and `created_by` (UUID ref -> users).

### 4.1 Core Tables

| Table | Key Fields | Description |
|---|---|---|
| organizations | id, name, address, logo_url, phone, email, settings_json | NGO master data |
| users | id, org_id, email, full_name, role, avatar_url, phone, is_active | Staff, coordinators, admins |
| roles | id, name, permissions_json | Admin / Coordinator / Mentor (flexibly extensible) |
| activity_log | id, user_id, entity_type, entity_id, action, old_value, new_value | Complete audit log |

### 4.2 Boys & Mentorship

| Table | Key Fields | Description |
|---|---|---|
| boys | id, full_name, date_of_birth, school_id, county, sub_county, guardian_name, guardian_phone, enrollment_date, status (active/graduated/inactive), notes | Mentored boys master data |
| schools | id, name, county, sub_county, contact_person, phone, email, partnership_date, is_active | Partner schools |
| mentors | id, user_id, full_name, phone, email, expertise, county, availability_json, is_active | Mentor profiles |
| mentor_assignments | id, mentor_id, boy_id, assigned_date, status (active/completed), notes | Mentor-to-boy assignments |
| progress_notes | id, boy_id, mentor_id, date, category (academic/emotional/behavioral/leadership), note, rating (1-5) | Progress tracking entries |
| boy_documents | id, boy_id, file_url, doc_type (report_card/photo/certificate), uploaded_by | Supporting documents |

### 4.3 Donations & Finance

| Table | Key Fields | Description |
|---|---|---|
| donations | id, donor_name, donor_email, donor_phone, amount, currency (KES/USD), payment_method (mpesa/stripe/cash/bank), transaction_ref, status (pending/completed/failed), purpose, receipt_url, is_anonymous | All donations |
| expenses | id, category (transport/materials/venue/food/admin), amount, description, receipt_url, approved_by, project_id, event_id | All expenses |
| finance_reports | id, period_start, period_end, total_donations, total_expenses, balance, generated_by | Monthly/quarterly reports |
| donation_campaigns | id, name, description, target_amount, raised_amount, start_date, end_date, is_active | Fundraising campaigns |

### 4.4 Events & Seminars

| Table | Key Fields | Description |
|---|---|---|
| events | id, title, description, event_type (seminar/school_visit/workshop/fundraiser/community), school_id, location, county, date, start_time, end_time, status (planned/ongoing/completed/cancelled), budget, actual_cost, coordinator_id | All events and school visits |
| event_attendees | id, event_id, boy_id, attended (boolean) | Track attendance |
| event_media | id, event_id, file_url, media_type (photo/video), caption, uploaded_by | Event documentation |
| event_notes | id, event_id, user_id, note, created_at | Event observations and feedback |

### 4.5 Content Management & Social Media

| Table | Key Fields | Description |
|---|---|---|
| content_posts | id, title, body, media_urls (json array), platforms (json array: tiktok/instagram/youtube/facebook/twitter), first_comment, status (draft/scheduled/posted/failed), scheduled_at, posted_at, created_by | Content for social media |
| content_post_results | id, post_id, platform, external_post_id, post_url, status (success/failed), error_message, posted_at | Per-platform posting results |
| social_accounts | id, platform, account_name, access_token_encrypted, refresh_token_encrypted, token_expires_at, is_active | Connected social media accounts |
| testimonials | id, name, role (mentor/parent/boy/community_leader), quote, photo_url, is_featured, sort_order | Public testimonials for landing page |

### 4.6 Landing Page Content

| Table | Key Fields | Description |
|---|---|---|
| page_sections | id, page (home/about/contact), section_key, title, body, image_url, sort_order, is_active | Editable landing page content |
| impact_metrics | id, label (e.g. "Boys Mentored"), value, icon, sort_order | Dynamic impact numbers |
| team_members | id, name, title, bio, photo_url, social_links_json, sort_order, is_active | Team page profiles |
| contact_submissions | id, name, email, phone, subject, message, status (new/read/replied), replied_by | Contact form submissions |

---

## 5. Detailed Module Specifications

### 5.1 Module: Landing Page (Public)

URL: / | Visibility: Public (no auth required)

#### 5.1.1 Hero Section
- Bold headline: mission statement
- CTA buttons: "Donate Now" and "Learn More"
- Background image/video from recent events
- Impact counter animation (boys mentored, schools visited, communities reached)

#### 5.1.2 About Section
- Organization story and mission
- The problem: why the boy-child is in crisis
- The solution: what Sema Na Boychild does
- Team profiles (from team_members table)

#### 5.1.3 Programs Section
- Emotional Development
- Leadership Training
- Career & Purpose
- Each with description, icon, and link to learn more

#### 5.1.4 Testimonials Section
- Carousel of testimonials from mentors, parents, boys, community leaders
- Photo + quote + name + role
- Managed from admin panel (testimonials table)

#### 5.1.5 Contact Section
- Contact form (name, email, phone, subject, message)
- Social media links: TikTok, Instagram, Facebook, WhatsApp, YouTube
- Physical address and phone number
- Google Maps embed

#### 5.1.6 Donate Section
- Donation amount presets (500 KES, 1000 KES, 2500 KES, 5000 KES, custom)
- M-Pesa payment integration (primary for Kenya)
- Stripe for international card payments
- Option for anonymous donations
- Active campaigns display (from donation_campaigns)

---

### 5.2 Module: Dashboard

URL: /dashboard | Visibility: All roles (filtered by permissions)

| Widget | Description | Data Source |
|---|---|---|
| Total Boys Mentored (Card) | Count with trend indicator | boys WHERE status = active |
| Active Mentors (Card) | Number of active mentors | mentors WHERE is_active = true |
| Donations This Month (Card) | Sum of donations this month | donations WHERE status = completed |
| Upcoming Events (Card) | Next 3 scheduled events | events WHERE date >= now() ORDER BY date |
| Donation Trend | Line chart: monthly donations over 12 months | donations GROUP BY month |
| Recent Activity Feed | Last 15 actions with user + timestamp | activity_log ORDER BY created_at DESC |
| School Visits Map | County-level map of visited schools | schools + events JOIN |
| Campaign Progress | Active campaigns with progress bars | donation_campaigns WHERE is_active |

---

### 5.3 Module: Boys Database

URL: /boys | Core tracking module

#### 5.3.1 Boys List
- Table view: Name, age, school, county, mentor, status, enrollment date
- Filter: County, school, status, mentor, date range
- Search: Full-text search by name
- Quick actions: View profile, assign mentor, add note
- Export: CSV/Excel for reporting

#### 5.3.2 Boy Profile (Detail Page)
- Header: Photo, name, age, school, guardian contact
- Tabs: Progress Notes | Documents | Attendance | Mentor History
- Progress timeline: Chronological notes from mentors
- Progress radar chart: Academic, Emotional, Behavioral, Leadership scores over time
- Attendance record: Events and seminars attended

#### 5.3.3 Add New Boy
- Form: Full name, date of birth, school (dropdown from schools), county, sub-county, guardian name, guardian phone
- Auto-assign to coordinator based on county
- Status defaults to "active"

---

### 5.4 Module: Mentors

URL: /mentors | Mentor management

#### 5.4.1 Mentor List
- Table view: Name, expertise, county, assigned boys count, availability, status
- Filter: County, expertise, availability
- Action: View profile, assign boys

#### 5.4.2 Mentor Profile
- Bio, expertise areas, contact info
- Assigned boys with quick links
- Activity history: notes added, events attended
- Availability calendar

#### 5.4.3 Mentor Assignment
- Drag & drop or form-based assignment of boys to mentors
- Max capacity per mentor (configurable)
- Notification sent to mentor on new assignment

---

### 5.5 Module: Donations

URL: /donations | Full financial transparency

#### 5.5.1 Donation List
- Table view: Donor (or "Anonymous"), amount, method, date, purpose, status
- Filter: Payment method, date range, purpose, campaign
- Totals row: Sum of all filtered donations
- Export: Excel/CSV for accounting

#### 5.5.2 M-Pesa Integration (Daraja API)
- STK Push: Initiate payment request to donor's phone
- C2B confirmation: Webhook receives payment confirmation
- Auto-create donation record on successful payment
- Auto-generate and email receipt

#### 5.5.3 Stripe Integration
- Embedded checkout for international donors
- Webhook for payment confirmation
- Currency conversion display (USD -> KES)

#### 5.5.4 Donation Campaigns
- Create campaign: Name, description, target amount, start/end date
- Public campaign page (linked from landing page)
- Progress bar with real-time updates
- Share links for social media

#### 5.5.5 Receipts & Reporting
- Auto-generated PDF receipts
- Monthly donation summary
- Donor list (with consent) for transparency reports

---

### 5.6 Module: Events & Seminars

URL: /events | School visits and event management

#### 5.6.1 Event Calendar
- Calendar view (month/week/day) of all events
- Color-coded by event type (seminar, school visit, workshop, fundraiser)
- Click to view/edit event details

#### 5.6.2 Create Event
- Form: Title, type, school (if school visit), location, county, date, time, budget estimate, coordinator
- For school visits: Select from partner schools or add new school
- Auto-create donation request if budget needed

#### 5.6.3 Event Detail Page
- Header: Title, date, location, status, coordinator
- Tabs: Details | Attendees | Media | Notes | Budget
- Attendees: Checklist of boys, mark attendance
- Media: Upload photos and videos from the event
- Budget: Planned vs. actual expenses

#### 5.6.4 Event Documentation
- Mandatory: Upload at least 1 photo after event completion
- Notes: Observations, outcomes, feedback
- This feeds into the content management pipeline

---

### 5.7 Module: Content Management

URL: /content | Marketing & social media automation

**This is the NGO's marketing engine. All events, places visited, and media are captured and distributed across social platforms.**

#### 5.7.1 Content Upload
- Rich text editor (Tiptap) for post body
- Media upload: Photos, videos (from device or from event media library)
- Select target platforms: TikTok, Instagram, YouTube, Facebook, Twitter (multi-select)
- First comment field: System will auto-post this as the first comment on each platform
- Schedule or post immediately

#### 5.7.2 Social Media Auto-Posting
- On publish: System distributes content to all selected platforms via their APIs
- Platform-specific formatting:
  - **Instagram**: Image/carousel + caption + first comment (hashtags)
  - **TikTok**: Video + description + first comment
  - **YouTube**: Video + title + description + first comment
  - **Facebook**: Post + image/video + first comment
  - **Twitter/X**: Tweet text (280 char limit) + media + reply with first comment
- Status tracking per platform (success/failed with error details)
- Retry mechanism for failed posts

#### 5.7.3 Content Calendar
- Calendar view of scheduled and posted content
- Drag to reschedule
- Color-coded by platform and status

#### 5.7.4 Content Library
- All media (photos, videos) organized by event, date, type
- Searchable and filterable
- Quick-reuse for new posts

---

### 5.8 Module: Finance Tracker

URL: /finance | All money runs through the system

#### 5.8.1 Financial Overview
- Total donations (all time, this month, this quarter)
- Total expenses (all time, this month, this quarter)
- Balance: Donations - Expenses
- Charts: Income vs. expenses over time

#### 5.8.2 Expense Management
- Log expenses: Category, amount, description, receipt upload, linked event/project
- Approval workflow: Coordinator submits -> Admin approves
- Categories: Transport, Materials, Venue, Food, Admin, Other

#### 5.8.3 Financial Reports
- Generate monthly/quarterly/annual reports
- Export as PDF or Excel
- Breakdown by category, event, campaign
- Full audit trail via activity_log

---

### 5.9 Module: Reports & Impact

URL: /reports | Impact measurement and reporting

- Boys mentored over time (chart)
- Schools visited (map + list)
- Events conducted by type (chart)
- Mentor activity summary
- Donation utilization report
- Exportable impact reports for donors and stakeholders
- Custom date range filtering

---

### 5.10 Module: Settings

URL: /settings | Admin only

| Area | Content |
|---|---|
| Organization Data | Name, address, logo, phone, email, social media links |
| Users & Invitations | User list, invite new user (email -> Supabase Invite), assign role |
| Roles & Permissions | Role matrix: What can Admin/Coordinator/Mentor see/edit |
| Social Media Accounts | Connect/disconnect TikTok, Instagram, YouTube, Facebook, Twitter |
| Payment Settings | M-Pesa API keys (Daraja), Stripe keys |
| Email Settings | Resend API key, email templates |
| Landing Page Content | Edit hero text, about section, programs, impact metrics |

---

## 6. Roles & Permissions Matrix

Three standard roles, flexibly extensible. Implemented via Supabase RLS + frontend guards.

| Module / Action | Admin | Coordinator | Mentor |
|---|---|---|---|
| Dashboard — all KPIs | Yes | Partial | Partial |
| Dashboard — financials | Yes | Yes | No |
| Boys — view all | Yes | Yes | Assigned only |
| Boys — add/edit | Yes | Yes | No |
| Boys — add progress notes | Yes | Yes | Assigned only |
| Mentors — manage | Yes | Yes | No |
| Mentors — view | Yes | Yes | Own profile |
| Donations — view all | Yes | Yes | No |
| Donations — manage campaigns | Yes | No | No |
| Events — create/edit | Yes | Yes | No |
| Events — view all | Yes | Yes | Attending only |
| Events — upload media | Yes | Yes | Yes |
| Content — create/post | Yes | Yes | No |
| Content — manage accounts | Yes | No | No |
| Finance — view | Yes | Yes | No |
| Finance — approve expenses | Yes | No | No |
| Reports — generate | Yes | Yes | No |
| Settings | Yes | No | No |
| Activity log | Yes | Yes | No |
| Landing page — edit | Yes | No | No |

---

## 7. External Integrations

### 7.1 M-Pesa (Daraja API)

- STK Push for donor-initiated payments
- C2B API for direct M-Pesa transfers
- Authentication: Consumer key + secret (stored encrypted in settings)
- Callback URL: POST /api/payments/mpesa/callback
- Auto-reconciliation: Match transaction_ref to donation record
- Sandbox testing before production go-live

### 7.2 Stripe

- Stripe Checkout for international card payments
- Webhook: POST /api/payments/stripe/webhook
- Currency: USD, GBP, EUR -> auto-convert display to KES
- Stripe Customer portal for recurring donors

### 7.3 Social Media APIs

#### TikTok (Content Posting API)
- Video upload endpoint
- Caption + hashtags
- First comment via reply API
- OAuth2 authentication

#### Instagram (Graph API via Facebook)
- Image/carousel/video posting
- Caption with hashtags
- First comment via comment endpoint
- Business account required

#### YouTube (Data API v3)
- Video upload with title, description, tags
- First comment via comment thread endpoint
- OAuth2 authentication

#### Facebook (Graph API)
- Page post with media
- First comment via comment endpoint
- Page access token required

#### Twitter/X (API v2)
- Tweet with media upload
- Reply tweet for first comment
- OAuth2 authentication

### 7.4 Email (Resend)

- Donation receipts (auto-sent on successful payment)
- Event notifications to mentors and coordinators
- Monthly newsletter to donors (optional)
- Contact form auto-reply

---

## 8. Orchestrator Task Breakdown (Claude Code)

Complete task list for the orchestrator. Each phase is independently deployable and testable.

### Phase 1 — Foundation (Week 1)

| Task ID | Task | Output | Dependency |
|---|---|---|---|
| P1-01 | Initialize Next.js 14 project (App Router, TypeScript, Tailwind) | / | — |
| P1-02 | Create Supabase project, set up all tables from schema | SQL Migrations | P1-01 |
| P1-03 | Supabase Auth: Login page, session handling, middleware | /login | P1-02 |
| P1-04 | Implement RLS policies for all roles | SQL Policies | P1-02, P1-03 |
| P1-05 | Layout: Sidebar, navigation, header, theme (Forest green #1B4332) | /layout | P1-01 |
| P1-06 | Settings — Organization data & user management | /settings | P1-03, P1-04 |

### Phase 2 — Landing Page & Core Data (Week 2)

| Task ID | Task | Output | Dependency |
|---|---|---|---|
| P2-01 | Landing page: Hero, About, Programs, Testimonials, Contact, Donate | / (public) | P1-01 |
| P2-02 | Contact form submission + admin notification | /api/contact | P2-01, P1-02 |
| P2-03 | Schools CRUD: Add/edit partner schools | /schools | P1-02 |
| P2-04 | Boys Database: List, add, edit, profile page | /boys | P1-02, P2-03 |
| P2-05 | Mentors: List, profiles, availability | /mentors | P1-02 |
| P2-06 | Mentor-Boy assignments + progress notes | /boys/:id | P2-04, P2-05 |

### Phase 3 — Donations & Finance (Week 3)

| Task ID | Task | Output | Dependency |
|---|---|---|---|
| P3-01 | M-Pesa Daraja API integration (STK Push + callback) | /api/payments/mpesa | P1-02 |
| P3-02 | Stripe Checkout integration + webhook | /api/payments/stripe | P1-02 |
| P3-03 | Donation list, filtering, receipts | /donations | P3-01, P3-02 |
| P3-04 | Donation campaigns CRUD + public campaign page | /donations/campaigns | P3-03 |
| P3-05 | Landing page donate section wired to payment APIs | / (donate section) | P2-01, P3-01, P3-02 |
| P3-06 | Expense tracking: CRUD, receipt upload, approval workflow | /finance | P1-02 |
| P3-07 | Financial reports: Monthly/quarterly generation + export | /finance/reports | P3-03, P3-06 |

### Phase 4 — Events & Seminars (Week 4)

| Task ID | Task | Output | Dependency |
|---|---|---|---|
| P4-01 | Events CRUD: Create, edit, calendar view | /events | P1-02, P2-03 |
| P4-02 | Event detail page: Attendees, media upload, notes, budget | /events/:id | P4-01 |
| P4-03 | Attendance tracking: Link boys to events | /events/:id/attendees | P4-01, P2-04 |
| P4-04 | Event media gallery + upload | /events/:id/media | P4-01 |
| P4-05 | Auto-link event budget to finance tracker | Calc Service | P4-01, P3-06 |

### Phase 5 — Content Management & Social Media (Week 5)

| Task ID | Task | Output | Dependency |
|---|---|---|---|
| P5-01 | Content post creation: Editor, media upload, platform selection | /content/new | P1-02 |
| P5-02 | Social media account connection (OAuth flows) | /settings/social | P1-06 |
| P5-03 | Auto-posting engine: Distribute to selected platforms | /api/content/post | P5-01, P5-02 |
| P5-04 | First comment automation: Auto-post first comment on each platform | /api/content/comment | P5-03 |
| P5-05 | Content calendar: Scheduled posts, status tracking | /content | P5-01, P5-03 |
| P5-06 | Content library: Media browser from events + uploads | /content/library | P4-04, P5-01 |

### Phase 6 — Dashboard, Reports & Polish (Week 6)

| Task ID | Task | Output | Dependency |
|---|---|---|---|
| P6-01 | Dashboard: All widgets, KPIs, charts | /dashboard | P2-04, P3-03, P4-01 |
| P6-02 | Impact reports: Aggregate data, charts, export | /reports | P2-04, P3-03, P4-01 |
| P6-03 | Activity log: Logging hooks in all CRUD actions | activity_log | P1-02 |
| P6-04 | Role-based UI guards (frontend), all modules | Middleware/HOC | P1-04 |
| P6-05 | Landing page CMS: Edit content from admin panel | /settings/content | P2-01 |
| P6-06 | Email notifications: Donation receipts, event reminders | /api/email | P3-03, P4-01 |
| P6-07 | Mobile responsive: Optimize all pages | CSS | P1-05 |
| P6-08 | End-to-end testing (Playwright) for core flows | tests/e2e/ | All |
| P6-09 | Deployment: Vercel + Supabase Prod, ENV configuration | vercel.json | All |

---

## 9. API Route Overview

All routes as Next.js API Routes (/app/api/...). Auth via Supabase session cookie.

| Method | Route | Description |
|---|---|---|
| GET/POST | /api/boys | List + create boy |
| GET/PUT | /api/boys/:id | Boy detail + update |
| GET/POST | /api/boys/:id/notes | Progress notes for a boy |
| GET/POST | /api/mentors | List + create mentor |
| GET/PUT | /api/mentors/:id | Mentor detail + update |
| POST | /api/mentors/assign | Assign mentor to boy |
| GET/POST | /api/schools | List + create school |
| GET/PUT | /api/schools/:id | School detail + update |
| GET/POST | /api/donations | List + create donation |
| GET | /api/donations/:id | Donation detail |
| GET/POST | /api/donations/campaigns | Campaign list + create |
| POST | /api/payments/mpesa/stk | Initiate M-Pesa STK Push |
| POST | /api/payments/mpesa/callback | M-Pesa payment callback |
| POST | /api/payments/stripe/checkout | Create Stripe checkout session |
| POST | /api/payments/stripe/webhook | Stripe webhook handler |
| GET/POST | /api/events | List + create event |
| GET/PUT | /api/events/:id | Event detail + update |
| POST | /api/events/:id/attendance | Mark attendance |
| GET/POST | /api/events/:id/media | Event media upload + list |
| GET/POST | /api/expenses | List + create expense |
| PUT | /api/expenses/:id/approve | Approve expense (Admin) |
| GET/POST | /api/content | Content posts list + create |
| POST | /api/content/:id/publish | Publish to social platforms |
| POST | /api/content/:id/comment | Post first comment on platforms |
| GET/POST | /api/social-accounts | Connected social accounts |
| POST | /api/social-accounts/connect | OAuth connect flow |
| GET/POST | /api/testimonials | Landing page testimonials |
| POST | /api/contact | Contact form submission |
| GET/POST | /api/users | User management (Admin) |
| POST | /api/users/invite | Invite user |
| GET | /api/activity-log | Activity log |
| GET | /api/reports/impact | Generate impact report |
| GET | /api/reports/finance | Generate financial report |
| GET | /api/dashboard/stats | Dashboard KPI data |

---

## 10. Non-Functional Requirements

| Requirement | Target Value |
|---|---|
| Page Load Time (LCP) | < 2.5 seconds (Vercel Edge + Supabase CDN) |
| Data Protection | Supabase RLS, HTTPS-only, password hashing via Supabase Auth |
| Database Size | Optimized for up to 10,000 boys, 1,000 mentors, 50,000 donations |
| Concurrent Users | Up to 100 concurrent users without degradation |
| Backup | Supabase daily automatic backups, point-in-time recovery |
| Security | Supabase RLS, HTTPS-only, encrypted API keys, input sanitization |
| Mobile | Responsive design — fully usable on mobile devices |
| SEO | Landing page optimized: meta tags, OG tags, structured data, sitemap |
| Uptime | 99.9% via Vercel + Supabase SLA |
| Media Storage | All event photos/videos in Supabase Storage, unlimited |
| Social API Rate Limits | Respect platform rate limits, queue-based posting with retry |
| Accessibility | WCAG 2.1 AA compliance on landing page |

---

## 11. Content Management Flow

The content management system is a core marketing strategy for the NGO. Here is the complete flow:

```
Event/Activity Happens
        |
        v
Photos & Videos Captured (uploaded to event media)
        |
        v
Content Creator opens /content/new
        |
        v
Selects media from library or uploads new
        |
        v
Writes caption/body + first comment text
        |
        v
Selects platforms: [TikTok] [Instagram] [YouTube] [Facebook] [Twitter]
        |
        v
Clicks "Post Now" or "Schedule"
        |
        v
System distributes to each platform via API
        |
        v
System auto-posts first comment on each platform
        |
        v
Status tracked per platform (success/failed/retry)
        |
        v
Content calendar shows all past and scheduled posts
```

---

## 12. Orchestrator Prompt Package

The following system prompt is passed to the Claude Code orchestrator to control development:

*You are a senior full-stack developer. You are building Sema Na Boychild — an NGO platform for boy-child mentorship and advocacy in Kenya. Stack: Next.js 14 (App Router), Supabase, TypeScript, Tailwind, shadcn/ui. Start with Phase 1: Foundation (Tasks P1-01 to P1-06). Every component must be production-ready, type-safe, and secured with Supabase RLS. Execute tasks sequentially. After each task: brief confirmation + next task.*

---

## 13. Additional Features (Inspired by amanmustcry.org)

The following features should be added to enhance the platform, inspired by best practices from similar NGO platforms:

### 13.1 Blog & Vlog Section
- Public blog page at `/blog` with articles about mentorship, events, and impact stories
- Vlog page at `/vlogs` embedding YouTube videos from the NGO's channel
- Admin can create/edit blog posts from the dashboard
- Blog posts support featured images, categories, and tags

### 13.2 Gallery Page
- Public gallery at `/gallery` showcasing photos and videos from events
- Pulls from event_media table (photos uploaded after events)
- Filterable by event type, date, and school
- Lightbox view for photos

### 13.3 Newsletter Subscription
- Email collection form on landing page and footer
- Stored in a `newsletter_subscribers` table
- Monthly digest emails via Resend

### 13.4 Team / Leadership Page
- Public page showcasing the NGO's leadership and core mentors
- Pulls from `team_members` table (already in schema)
- Photo, name, title, bio, social links

### 13.5 Theory of Change Section
- Detailed section on the landing page explaining the NGO's framework
- Visual infographic: Problem -> Intervention -> Output -> Outcome -> Impact

### 13.6 Upcoming Events on Homepage
- Preview of next 3 upcoming events on the landing page
- Pulled from events table where date >= today
- Links to full events page or individual event details

### 13.7 Featured Videos
- Section on homepage featuring 2-3 YouTube video embeds
- Managed from admin (content_posts where platform includes youtube)

### 13.8 Volunteer Signup
- Form on landing page for potential mentors/volunteers
- Captures: name, email, phone, county, expertise, availability
- Creates a mentor record with status "pending_approval"

---

## 14. Done Items

- [x] Domain acquired
- [x] Landing page design (HTML/Tailwind prototype in repo)
- [x] Color scheme defined: Forest #1B4332, Clay #C1662D, Gold #D4A373, Sand #F1EFEA
- [x] Social media presence: TikTok, Instagram, Facebook, WhatsApp, YouTube

---

*Document created with Claude - Sema Na Boychild - Version 1.0*
