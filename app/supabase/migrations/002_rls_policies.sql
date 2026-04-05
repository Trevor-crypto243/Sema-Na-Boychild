-- Sema Na Boychild - Row Level Security Policies
-- Migration 002: RLS Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE boys ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE boy_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_post_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if user is admin or coordinator
CREATE OR REPLACE FUNCTION is_admin_or_coordinator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'coordinator'));
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE POLICY "Users can view their organization" ON organizations FOR SELECT USING (true);
CREATE POLICY "Admins can update organization" ON organizations FOR UPDATE USING (is_admin());

-- ============================================
-- USERS
-- ============================================
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update any user" ON users FOR UPDATE USING (is_admin());

-- ============================================
-- ROLES
-- ============================================
CREATE POLICY "Anyone can view roles" ON roles FOR SELECT USING (true);

-- ============================================
-- ACTIVITY LOG
-- ============================================
CREATE POLICY "Admin/Coordinator can view activity log" ON activity_log FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "Any authenticated user can insert activity log" ON activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- BOYS
-- ============================================
CREATE POLICY "Admin/Coordinator can view all boys" ON boys FOR SELECT USING (
  is_admin_or_coordinator()
  OR EXISTS (
    SELECT 1 FROM mentor_assignments ma
    JOIN mentors m ON m.id = ma.mentor_id
    WHERE ma.boy_id = boys.id AND m.user_id = auth.uid() AND ma.status = 'active'
  )
);
CREATE POLICY "Admin/Coordinator can insert boys" ON boys FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update boys" ON boys FOR UPDATE USING (is_admin_or_coordinator());
CREATE POLICY "Admin can delete boys" ON boys FOR DELETE USING (is_admin());

-- ============================================
-- SCHOOLS
-- ============================================
CREATE POLICY "Anyone authenticated can view schools" ON schools FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/Coordinator can manage schools" ON schools FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update schools" ON schools FOR UPDATE USING (is_admin_or_coordinator());

-- ============================================
-- MENTORS
-- ============================================
CREATE POLICY "Anyone authenticated can view mentors" ON mentors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/Coordinator can manage mentors" ON mentors FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update mentors" ON mentors FOR UPDATE USING (
  is_admin_or_coordinator() OR user_id = auth.uid()
);

-- ============================================
-- MENTOR ASSIGNMENTS
-- ============================================
CREATE POLICY "View assignments" ON mentor_assignments FOR SELECT USING (
  is_admin_or_coordinator()
  OR EXISTS (SELECT 1 FROM mentors WHERE id = mentor_assignments.mentor_id AND user_id = auth.uid())
);
CREATE POLICY "Admin/Coordinator can manage assignments" ON mentor_assignments FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update assignments" ON mentor_assignments FOR UPDATE USING (is_admin_or_coordinator());

-- ============================================
-- PROGRESS NOTES
-- ============================================
CREATE POLICY "View progress notes" ON progress_notes FOR SELECT USING (
  is_admin_or_coordinator()
  OR EXISTS (SELECT 1 FROM mentors WHERE id = progress_notes.mentor_id AND user_id = auth.uid())
);
CREATE POLICY "Mentors can add progress notes" ON progress_notes FOR INSERT WITH CHECK (
  is_admin_or_coordinator()
  OR EXISTS (SELECT 1 FROM mentors WHERE id = progress_notes.mentor_id AND user_id = auth.uid())
);

-- ============================================
-- BOY DOCUMENTS
-- ============================================
CREATE POLICY "View boy documents" ON boy_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Upload boy documents" ON boy_documents FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- DONATIONS
-- ============================================
CREATE POLICY "Admin/Coordinator can view donations" ON donations FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "Anyone can create donation" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update donations" ON donations FOR UPDATE USING (is_admin());

-- ============================================
-- DONATION CAMPAIGNS
-- ============================================
CREATE POLICY "Anyone can view active campaigns" ON donation_campaigns FOR SELECT USING (true);
CREATE POLICY "Admin can manage campaigns" ON donation_campaigns FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update campaigns" ON donation_campaigns FOR UPDATE USING (is_admin());

-- ============================================
-- EXPENSES
-- ============================================
CREATE POLICY "Admin/Coordinator can view expenses" ON expenses FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can create expenses" ON expenses FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin can approve expenses" ON expenses FOR UPDATE USING (is_admin());

-- ============================================
-- FINANCE REPORTS
-- ============================================
CREATE POLICY "Admin/Coordinator can view finance reports" ON finance_reports FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "Admin can create finance reports" ON finance_reports FOR INSERT WITH CHECK (is_admin());

-- ============================================
-- EVENTS
-- ============================================
CREATE POLICY "View events" ON events FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/Coordinator can create events" ON events FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update events" ON events FOR UPDATE USING (is_admin_or_coordinator());

-- ============================================
-- EVENT ATTENDEES
-- ============================================
CREATE POLICY "View event attendees" ON event_attendees FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/Coordinator can manage attendees" ON event_attendees FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update attendees" ON event_attendees FOR UPDATE USING (is_admin_or_coordinator());

-- ============================================
-- EVENT MEDIA
-- ============================================
CREATE POLICY "View event media" ON event_media FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can upload media" ON event_media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- EVENT NOTES
-- ============================================
CREATE POLICY "View event notes" ON event_notes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can add notes" ON event_notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- CONTENT POSTS
-- ============================================
CREATE POLICY "Admin/Coordinator can view content" ON content_posts FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can create content" ON content_posts FOR INSERT WITH CHECK (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update content" ON content_posts FOR UPDATE USING (is_admin_or_coordinator());
CREATE POLICY "Admin can delete content" ON content_posts FOR DELETE USING (is_admin());

-- ============================================
-- CONTENT POST RESULTS
-- ============================================
CREATE POLICY "Admin/Coordinator can view results" ON content_post_results FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "System can insert results" ON content_post_results FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- SOCIAL ACCOUNTS
-- ============================================
CREATE POLICY "Admin can view social accounts" ON social_accounts FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage social accounts" ON social_accounts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update social accounts" ON social_accounts FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete social accounts" ON social_accounts FOR DELETE USING (is_admin());

-- ============================================
-- TESTIMONIALS (public read)
-- ============================================
CREATE POLICY "Anyone can view testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin can manage testimonials" ON testimonials FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update testimonials" ON testimonials FOR UPDATE USING (is_admin());
CREATE POLICY "Admin can delete testimonials" ON testimonials FOR DELETE USING (is_admin());

-- ============================================
-- IMPACT METRICS (public read)
-- ============================================
CREATE POLICY "Anyone can view impact metrics" ON impact_metrics FOR SELECT USING (true);
CREATE POLICY "Admin can manage impact metrics" ON impact_metrics FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin can update impact metrics" ON impact_metrics FOR UPDATE USING (is_admin());

-- ============================================
-- CONTACT SUBMISSIONS
-- ============================================
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin/Coordinator can view submissions" ON contact_submissions FOR SELECT USING (is_admin_or_coordinator());
CREATE POLICY "Admin/Coordinator can update submissions" ON contact_submissions FOR UPDATE USING (is_admin_or_coordinator());
