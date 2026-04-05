-- Sema Na Boychild - Complete Database Schema
-- Migration 001: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CORE TABLES
-- ============================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  settings_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'mentor' CHECK (role IN ('admin', 'coordinator', 'mentor')),
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  permissions_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BOYS & MENTORSHIP
-- ============================================

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  county TEXT NOT NULL,
  sub_county TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  partnership_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE boys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  school_id UUID REFERENCES schools(id),
  county TEXT NOT NULL,
  sub_county TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  expertise TEXT,
  county TEXT,
  availability_json JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mentor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id),
  boy_id UUID NOT NULL REFERENCES boys(id),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE progress_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boy_id UUID NOT NULL REFERENCES boys(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES mentors(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('academic', 'emotional', 'behavioral', 'leadership')),
  note TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE boy_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boy_id UUID NOT NULL REFERENCES boys(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('report_card', 'photo', 'certificate')),
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. DONATIONS & FINANCE
-- ============================================

CREATE TABLE donation_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC(12,2) NOT NULL,
  raised_amount NUMERIC(12,2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES' CHECK (currency IN ('KES', 'USD')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'stripe', 'cash', 'bank')),
  transaction_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  purpose TEXT,
  campaign_id UUID REFERENCES donation_campaigns(id),
  receipt_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('transport', 'materials', 'venue', 'food', 'admin', 'other')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  receipt_url TEXT,
  approved_by UUID REFERENCES users(id),
  event_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finance_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_donations NUMERIC(12,2) DEFAULT 0,
  total_expenses NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,
  generated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. EVENTS & SEMINARS
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('seminar', 'school_visit', 'workshop', 'fundraiser', 'community')),
  school_id UUID REFERENCES schools(id),
  location TEXT NOT NULL,
  county TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed', 'cancelled')),
  budget NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  coordinator_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Add FK from expenses to events now that events exists
ALTER TABLE expenses ADD CONSTRAINT fk_expenses_event FOREIGN KEY (event_id) REFERENCES events(id);

CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  boy_id UUID NOT NULL REFERENCES boys(id),
  attended BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, boy_id)
);

CREATE TABLE event_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. CONTENT MANAGEMENT & SOCIAL MEDIA
-- ============================================

CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  body TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]',
  platforms JSONB DEFAULT '[]',
  first_comment TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed')),
  scheduled_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE content_post_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES content_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_post_id TEXT,
  post_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. LANDING PAGE CONTENT
-- ============================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('mentor', 'parent', 'boy', 'community_leader')),
  quote TEXT NOT NULL,
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE impact_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  replied_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. INDEXES
-- ============================================

CREATE INDEX idx_boys_school ON boys(school_id);
CREATE INDEX idx_boys_status ON boys(status);
CREATE INDEX idx_boys_county ON boys(county);
CREATE INDEX idx_mentor_assignments_mentor ON mentor_assignments(mentor_id);
CREATE INDEX idx_mentor_assignments_boy ON mentor_assignments(boy_id);
CREATE INDEX idx_progress_notes_boy ON progress_notes(boy_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_campaign ON donations(campaign_id);
CREATE INDEX idx_donations_created ON donations(created_at);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_content_posts_status ON content_posts(status);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created ON activity_log(created_at);

-- ============================================
-- 8. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boys_updated_at BEFORE UPDATE ON boys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_campaigns_updated_at BEFORE UPDATE ON donation_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_posts_updated_at BEFORE UPDATE ON content_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_impact_metrics_updated_at BEFORE UPDATE ON impact_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. SEED DATA
-- ============================================

INSERT INTO impact_metrics (label, value, icon, sort_order) VALUES
  ('Boys Mentored', 300, 'users', 1),
  ('Schools Partnered', 12, 'school', 2),
  ('Communities Reached', 5, 'map-pin', 3),
  ('Events Held', 25, 'calendar', 4);

INSERT INTO roles (name, permissions_json) VALUES
  ('admin', '{"all": true}'),
  ('coordinator', '{"boys": true, "mentors": true, "events": true, "content": true, "donations": {"view": true}, "finance": {"view": true}, "reports": true}'),
  ('mentor', '{"boys": {"assigned_only": true}, "events": {"attending_only": true}, "mentors": {"own_profile": true}}');
