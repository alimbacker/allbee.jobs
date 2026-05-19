-- ============================================================
-- AllBee Jobs - Complete Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- for location-based queries

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('seeker', 'employer', 'admin');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');
CREATE TYPE application_status AS ENUM ('applied', 'viewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn');
CREATE TYPE experience_level AS ENUM ('fresher', 'junior', 'mid', 'senior', 'lead');
CREATE TYPE salary_type AS ENUM ('monthly', 'yearly', 'hourly', 'per_day');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'seeker',
  language_preference TEXT DEFAULT 'en',  -- 'en' or 'ta' (Tamil)
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEEKER PROFILES
-- ============================================================

CREATE TABLE seeker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  skills TEXT[],
  experience_years INTEGER DEFAULT 0,
  experience_level experience_level DEFAULT 'fresher',
  current_location TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  preferred_job_types job_type[],
  preferred_categories TEXT[],
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  salary_type salary_type DEFAULT 'monthly',
  is_open_to_work BOOLEAN DEFAULT TRUE,
  resume_url TEXT,
  resume_filename TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  languages_known TEXT[] DEFAULT ARRAY['English'],
  education JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  profile_completion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  industry TEXT,
  company_size TEXT,  -- '1-10', '11-50', '51-200', etc.
  founded_year INTEGER,
  website TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'Tamil Nadu',
  pincode TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOB CATEGORIES
-- ============================================================

CREATE TABLE job_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  name_ta TEXT,  -- Tamil name
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  job_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- JOBS
-- ============================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by UUID NOT NULL REFERENCES profiles(id),
  category_id UUID REFERENCES job_categories(id),
  title TEXT NOT NULL,
  title_ta TEXT,  -- Tamil title
  slug TEXT UNIQUE,
  description TEXT NOT NULL,
  description_ta TEXT,
  requirements TEXT[],
  responsibilities TEXT[],
  skills_required TEXT[],
  job_type job_type NOT NULL DEFAULT 'full_time',
  experience_level experience_level DEFAULT 'fresher',
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER,
  salary_min INTEGER,
  salary_max INTEGER,
  salary_type salary_type DEFAULT 'monthly',
  is_salary_negotiable BOOLEAN DEFAULT FALSE,
  is_salary_disclosed BOOLEAN DEFAULT TRUE,
  location TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  is_remote BOOLEAN DEFAULT FALSE,
  is_hybrid BOOLEAN DEFAULT FALSE,
  vacancies INTEGER DEFAULT 1,
  application_deadline DATE,
  status job_status DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  whatsapp_apply BOOLEAN DEFAULT FALSE,
  whatsapp_number TEXT,
  tags TEXT[],
  benefits TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================================
-- JOB APPLICATIONS
-- ============================================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  cover_letter TEXT,
  resume_url TEXT,
  status application_status DEFAULT 'applied',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),
  employer_notes TEXT,
  is_seen_by_employer BOOLEAN DEFAULT FALSE,
  applied_via TEXT DEFAULT 'platform',  -- 'platform' or 'whatsapp'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

-- ============================================================
-- SAVED JOBS
-- ============================================================

CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- ============================================================
-- JOB VIEWS (analytics)
-- ============================================================

CREATE TABLE job_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',  -- 'info', 'success', 'warning', 'application', 'job'
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================

CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Jobs
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_category ON jobs(category_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(job_type);
CREATE INDEX idx_jobs_location ON jobs USING GIST(
  ST_MakePoint(location_lng::FLOAT, location_lat::FLOAT)
) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_featured ON jobs(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_jobs_search ON jobs USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- Applications
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_seeker ON applications(seeker_id);
CREATE INDEX idx_applications_company ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(status);

-- Profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_seeker_location ON seeker_profiles(location_lat, location_lng);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment job views
CREATE OR REPLACE FUNCTION increment_job_views(job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE jobs SET views_count = views_count + 1 WHERE id = job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate profile completion
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  sp seeker_profiles%ROWTYPE;
  p profiles%ROWTYPE;
BEGIN
  SELECT * INTO sp FROM seeker_profiles WHERE user_id = p_user_id;
  SELECT * INTO p FROM profiles WHERE id = p_user_id;
  
  IF p.full_name IS NOT NULL THEN score := score + 10; END IF;
  IF p.phone IS NOT NULL THEN score := score + 10; END IF;
  IF sp.headline IS NOT NULL THEN score := score + 10; END IF;
  IF sp.bio IS NOT NULL THEN score := score + 10; END IF;
  IF array_length(sp.skills, 1) > 0 THEN score := score + 15; END IF;
  IF sp.current_location IS NOT NULL THEN score := score + 10; END IF;
  IF sp.resume_url IS NOT NULL THEN score := score + 20; END IF;
  IF jsonb_array_length(sp.education) > 0 THEN score := score + 10; END IF;
  IF jsonb_array_length(sp.experience) > 0 THEN score := score + 5; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Get nearby jobs
CREATE OR REPLACE FUNCTION get_nearby_jobs(
  p_lat DECIMAL,
  p_lng DECIMAL,
  p_radius_km INTEGER DEFAULT 25,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  job_id UUID,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id as job_id,
    ROUND(
      ST_Distance(
        ST_MakePoint(p_lng::FLOAT, p_lat::FLOAT)::geography,
        ST_MakePoint(j.location_lng::FLOAT, j.location_lat::FLOAT)::geography
      ) / 1000
    )::DECIMAL as distance_km
  FROM jobs j
  WHERE 
    j.status = 'active'
    AND j.location_lat IS NOT NULL
    AND j.location_lng IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint(p_lng::FLOAT, p_lat::FLOAT)::geography,
      ST_MakePoint(j.location_lng::FLOAT, j.location_lat::FLOAT)::geography,
      p_radius_km * 1000
    )
  ORDER BY distance_km ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_seeker_profiles_updated_at
  BEFORE UPDATE ON seeker_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on auth signup
CREATE TRIGGER tr_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Seeker profiles
CREATE POLICY "Seeker profiles viewable by authenticated users"
  ON seeker_profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Seekers can manage own profile"
  ON seeker_profiles FOR ALL USING (auth.uid() = user_id);

-- Companies
CREATE POLICY "Companies are public"
  ON companies FOR SELECT USING (TRUE);

CREATE POLICY "Employers can manage own companies"
  ON companies FOR ALL USING (auth.uid() = owner_id);

-- Jobs
CREATE POLICY "Active jobs are public"
  ON jobs FOR SELECT USING (status = 'active' OR posted_by = auth.uid());

CREATE POLICY "Employers can manage own jobs"
  ON jobs FOR ALL USING (posted_by = auth.uid());

-- Applications
CREATE POLICY "Seekers see own applications"
  ON applications FOR SELECT USING (seeker_id = auth.uid());

CREATE POLICY "Employers see applications for their jobs"
  ON applications FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

CREATE POLICY "Seekers can apply"
  ON applications FOR INSERT WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE USING (
    seeker_id = auth.uid() OR
    company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid())
  );

-- Saved jobs
CREATE POLICY "Users manage own saved jobs"
  ON saved_jobs FOR ALL USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users see own notifications"
  ON notifications FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- SEED DATA: Job Categories
-- ============================================================

INSERT INTO job_categories (name, name_ta, slug, icon, color) VALUES
('IT & Software', 'தகவல் தொழில்நுட்பம்', 'it-software', '💻', '#3B82F6'),
('Sales & Marketing', 'விற்பனை & சந்தைப்படுத்தல்', 'sales-marketing', '📈', '#10B981'),
('Manufacturing', 'உற்பத்தி', 'manufacturing', '🏭', '#F59E0B'),
('Healthcare', 'சுகாதாரம்', 'healthcare', '🏥', '#EF4444'),
('Education', 'கல்வி', 'education', '#6366F1', '📚'),
('Retail', 'சில்லறை வர்த்தகம்', 'retail', '🛒', '#EC4899'),
('Construction', 'கட்டுமானம்', 'construction', '🏗️', '#F97316'),
('Hospitality', 'விருந்தோம்பல்', 'hospitality', '🍽️', '#14B8A6'),
('Transport & Logistics', 'போக்குவரத்து', 'transport-logistics', '🚛', '#8B5CF6'),
('Finance & Banking', 'நிதி & வங்கி', 'finance-banking', '🏦', '#06B6D4'),
('Textiles & Fashion', 'ஜவுளி & நாகரிகம்', 'textiles-fashion', '👗', '#F43F5E'),
('Security', 'பாதுகாப்பு', 'security', '🛡️', '#64748B'),
('Cleaning & Facilities', 'தூய்மை சேவைகள்', 'cleaning-facilities', '🧹', '#84CC16'),
('Customer Support', 'வாடிக்கையாளர் சேவை', 'customer-support', '🎧', '#F59E0B'),
('Beauty & Wellness', 'அழகு & ஆரோக்கியம்', 'beauty-wellness', '💆', '#A78BFA')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA: Sample Testimonials
-- ============================================================

INSERT INTO testimonials (name, role, company, content, rating) VALUES
('Priya Ramesh', 'Software Developer', 'TechCorp Coimbatore', 'Found my dream job within 2 weeks! AllBee Jobs made it so easy to find local opportunities near my home.', 5),
('Karthik Murugan', 'HR Manager', 'Vellalar Industries', 'As an employer, AllBee Jobs helped us hire 15 quality candidates in just one month. Excellent platform!', 5),
('Deepa Sundar', 'Teacher', 'Bright Future School', 'The Tamil language support made it very comfortable for me to use. Got placed as a teacher near my area!', 5),
('Vijay Kumar', 'Store Manager', 'SuperMart Retail', 'The nearby jobs feature is amazing. I filtered jobs within 5km of my home and got placed immediately.', 4),
('Anitha Selvam', 'Nurse', 'City Hospital', 'WhatsApp apply button is so convenient! Applied to jobs while commuting and got responses quickly.', 5);
