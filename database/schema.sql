-- Government Jobs Curator Database Schema
-- Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For similarity search

-- Main jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  
  -- Basic Information
  job_title TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  department TEXT,
  
  -- Vacancy Details
  total_vacancies INTEGER DEFAULT 1,
  post_category TEXT,
  
  -- Employment Information
  employment_type TEXT,
  position_level TEXT,
  
  -- Location
  location_state TEXT[],
  location_cities TEXT[],
  is_all_india BOOLEAN DEFAULT false,
  
  -- Qualification
  qualification_required TEXT[],
  min_qualification TEXT,
  max_qualification TEXT,
  
  -- Age
  min_age INTEGER,
  max_age INTEGER,
  age_relaxation JSONB,
  
  -- Experience
  experience_required TEXT,
  
  -- Salary
  salary_min INTEGER,
  salary_max INTEGER,
  pay_level TEXT,
  
  -- Application Fees
  application_mode TEXT,
  application_fee_general INTEGER,
  application_fee_obc INTEGER,
  application_fee_sc_st INTEGER,
  application_fee_pwd INTEGER,
  
  -- Important Dates
  notification_date TIMESTAMP WITH TIME ZONE,
  application_start_date TIMESTAMP WITH TIME ZONE,
  application_end_date TIMESTAMP WITH TIME ZONE,
  exam_date TIMESTAMP WITH TIME ZONE,
  
  -- Links
  official_notification_url TEXT,
  apply_link TEXT,
  official_website TEXT,
  
  -- Content
  job_description TEXT,
  selection_process TEXT,
  exam_pattern TEXT,
  important_instructions TEXT,
  required_skills TEXT,
  job_benefits TEXT,
  
  -- SEO
  json_ld_schema JSONB,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Metadata
  content_hash TEXT,
  status TEXT DEFAULT 'active',
  source TEXT,
  source_url TEXT,
  
  -- Flags
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Counters
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_jobs_content_hash ON jobs(content_hash);
CREATE INDEX idx_jobs_application_end_date ON jobs(application_end_date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_organization ON jobs(organization_name);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_title_trgm ON jobs USING gin (job_title gin_trgm_ops);
CREATE INDEX idx_jobs_org_trgm ON jobs USING gin (organization_name gin_trgm_ops);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to find similar jobs
CREATE OR REPLACE FUNCTION find_similar_jobs(
  job_title_input TEXT,
  org_name_input TEXT,
  threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  job_title TEXT,
  organization_name TEXT,
  similarity_score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.job_title,
    j.organization_name,
    GREATEST(
      similarity(j.job_title, job_title_input),
      similarity(j.organization_name, org_name_input)
    ) AS similarity_score
  FROM jobs j
  WHERE
    similarity(j.job_title, job_title_input) > threshold
    OR similarity(j.organization_name, org_name_input) > threshold
  ORDER BY similarity_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access"
  ON jobs
  FOR SELECT
  USING (is_active = true);

-- Policy for service role full access
CREATE POLICY "Allow service role all access"
  ON jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
