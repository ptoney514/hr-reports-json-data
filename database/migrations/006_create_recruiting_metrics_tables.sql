-- Migration 006: Create Recruiting Metrics Tables
-- HR Reports Neon Postgres Database
-- Stores recruiting and new hire dashboard metrics
-- Sources: Oracle HCM, Oracle Recruiting Cloud (myJobs), Interfolio

-- ============================================
-- DIMENSION: Application Sources
-- ============================================
-- Channels where applicants find job postings

CREATE TABLE IF NOT EXISTS dim_application_sources (
    source_id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL UNIQUE,
    source_category VARCHAR(50),  -- 'Job Board', 'Social Media', 'Direct', 'Referral'
    display_color VARCHAR(20),  -- Hex color for charts
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed application sources
INSERT INTO dim_application_sources (source_name, source_category, display_color, display_order) VALUES
    ('LinkedIn', 'Social Media', '#0A66C2', 1),
    ('Creighton Careers', 'Direct', '#0054A6', 2),
    ('External Career Site', 'Job Board', '#10B981', 3),
    ('jobright', 'Job Board', '#F59E0B', 4),
    ('Internal Career Site', 'Direct', '#8B5CF6', 5),
    ('Indeed', 'Job Board', '#2164F3', 6),
    ('Employee Referral', 'Referral', '#EC4899', 7),
    ('Other', 'Other', '#9CA3AF', 99)
ON CONFLICT (source_name) DO NOTHING;

COMMENT ON TABLE dim_application_sources IS 'Dimension table for application source channels';

-- ============================================
-- DIMENSION: Job Families
-- ============================================
-- Categories for grouping positions

CREATE TABLE IF NOT EXISTS dim_job_families (
    job_family_id SERIAL PRIMARY KEY,
    job_family_name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),  -- 'Academic', 'Administrative', 'Research', 'Support'
    display_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed job families
INSERT INTO dim_job_families (job_family_name, category, display_order) VALUES
    ('Academic & Student Affairs', 'Academic', 1),
    ('Administration', 'Administrative', 2),
    ('Health Services', 'Research', 3),
    ('Information Technology', 'Support', 4),
    ('Research', 'Research', 5),
    ('Facilities', 'Support', 6),
    ('Mission and Ministry', 'Administrative', 7),
    ('Public Safety & Transport', 'Support', 8),
    ('Communications & Marketing', 'Administrative', 9),
    ('Athletics & Recreation', 'Support', 10)
ON CONFLICT (job_family_name) DO NOTHING;

COMMENT ON TABLE dim_job_families IS 'Dimension table for job family categories';

-- ============================================
-- FACT: Recruiting Summary
-- ============================================
-- High-level summary metrics per quarter

CREATE TABLE IF NOT EXISTS fact_recruiting_summary (
    summary_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,  -- 'FY2026'
    fiscal_quarter INTEGER NOT NULL,  -- 1, 2, 3, 4

    -- Hire counts
    total_hires INTEGER NOT NULL DEFAULT 0,
    faculty_hires INTEGER NOT NULL DEFAULT 0,
    staff_hires INTEGER NOT NULL DEFAULT 0,
    omaha_hires INTEGER NOT NULL DEFAULT 0,
    phoenix_hires INTEGER NOT NULL DEFAULT 0,

    -- Pipeline counts
    open_requisitions INTEGER,
    active_applications INTEGER,
    new_applications INTEGER,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_recruiting_summary UNIQUE (fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_recruiting_summary_fy ON fact_recruiting_summary(fiscal_year);
CREATE INDEX idx_recruiting_summary_quarter ON fact_recruiting_summary(fiscal_quarter);

COMMENT ON TABLE fact_recruiting_summary IS 'Quarterly recruiting summary metrics';

-- ============================================
-- FACT: Hire Rates
-- ============================================
-- Hire rates by source system and channel

CREATE TABLE IF NOT EXISTS fact_hire_rates (
    rate_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    source_system VARCHAR(50) NOT NULL,  -- 'Taleo', 'Interfolio', 'Direct'
    channel VARCHAR(50) NOT NULL,  -- 'External', 'Internal', 'Faculty'

    -- Metrics
    applications INTEGER NOT NULL DEFAULT 0,
    hires INTEGER NOT NULL DEFAULT 0,
    hire_rate NUMERIC(5,2),  -- Calculated: hires/applications * 100

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_hire_rates UNIQUE (fiscal_year, fiscal_quarter, source_system, channel)
);

CREATE INDEX idx_hire_rates_fy ON fact_hire_rates(fiscal_year);

COMMENT ON TABLE fact_hire_rates IS 'Hire rates by source system and recruitment channel';

-- ============================================
-- FACT: Pipeline Metrics - Staff (myJobs)
-- ============================================
-- Oracle Recruiting Cloud metrics for staff hiring

CREATE TABLE IF NOT EXISTS fact_pipeline_metrics_staff (
    pipeline_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,

    -- Requisition metrics
    open_requisitions INTEGER,
    reqs_per_recruiter NUMERIC(5,2),
    avg_days_open NUMERIC(5,1),
    avg_time_to_fill NUMERIC(5,1),

    -- Application metrics
    active_applications INTEGER,
    new_applications INTEGER,
    apps_per_requisition NUMERIC(5,1),
    internal_app_percentage NUMERIC(5,2),
    referrals INTEGER,

    -- Hire metrics
    total_hires INTEGER,
    internal_hires INTEGER,
    internal_hire_rate NUMERIC(5,2),
    avg_days_to_hire NUMERIC(5,1),
    hr_processing_time NUMERIC(5,1),
    offer_acceptance_rate NUMERIC(5,2),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pipeline_staff UNIQUE (fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_pipeline_staff_fy ON fact_pipeline_metrics_staff(fiscal_year);

COMMENT ON TABLE fact_pipeline_metrics_staff IS 'Staff recruitment pipeline metrics from myJobs/ORC';

-- ============================================
-- FACT: Pipeline Metrics - Faculty (Interfolio)
-- ============================================
-- Interfolio metrics for faculty hiring

CREATE TABLE IF NOT EXISTS fact_pipeline_metrics_faculty (
    pipeline_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,

    -- Search metrics
    active_searches INTEGER,
    completed_searches INTEGER,

    -- Hire counts by type
    total_hires INTEGER,
    tenure_track_hires INTEGER,
    non_tenure_hires INTEGER,
    instructor_hires INTEGER,
    special_faculty_hires INTEGER,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_pipeline_faculty UNIQUE (fiscal_year, fiscal_quarter)
);

CREATE INDEX idx_pipeline_faculty_fy ON fact_pipeline_metrics_faculty(fiscal_year);

COMMENT ON TABLE fact_pipeline_metrics_faculty IS 'Faculty recruitment pipeline metrics from Interfolio';

-- ============================================
-- FACT: New Hires
-- ============================================
-- Individual hire records (hashed for PII protection)

CREATE TABLE IF NOT EXISTS fact_new_hires (
    hire_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,

    -- Hashed identifier (no PII)
    employee_hash VARCHAR(50) NOT NULL,

    -- Hire details
    hire_date DATE NOT NULL,
    position_title VARCHAR(200),
    department VARCHAR(200),
    school VARCHAR(100),
    employee_type VARCHAR(20) NOT NULL,  -- 'FACULTY', 'STAFF'
    assignment_code VARCHAR(10),  -- 'F09', 'F12', 'PT12', etc.
    location VARCHAR(10),  -- 'OMA', 'PHX'

    -- Demographics (aggregated, not individual)
    gender VARCHAR(20),
    ethnicity VARCHAR(100),
    age_band VARCHAR(20),

    -- ATS tracking
    in_interfolio BOOLEAN DEFAULT false,
    in_orc_ats BOOLEAN DEFAULT false,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_new_hire UNIQUE (employee_hash, hire_date)
);

CREATE INDEX idx_new_hires_fy ON fact_new_hires(fiscal_year);
CREATE INDEX idx_new_hires_quarter ON fact_new_hires(fiscal_quarter);
CREATE INDEX idx_new_hires_date ON fact_new_hires(hire_date);
CREATE INDEX idx_new_hires_type ON fact_new_hires(employee_type);
CREATE INDEX idx_new_hires_school ON fact_new_hires(school);

COMMENT ON TABLE fact_new_hires IS 'Individual new hire records with hashed employee identifiers';

-- ============================================
-- FACT: Hires by School
-- ============================================
-- Aggregated hire counts by school/organization

CREATE TABLE IF NOT EXISTS fact_hires_by_school (
    school_hire_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    school_name VARCHAR(100) NOT NULL,

    -- Counts
    faculty_hires INTEGER NOT NULL DEFAULT 0,
    staff_hires INTEGER NOT NULL DEFAULT 0,
    total_hires INTEGER NOT NULL DEFAULT 0,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_hires_school UNIQUE (fiscal_year, fiscal_quarter, school_name)
);

CREATE INDEX idx_hires_school_fy ON fact_hires_by_school(fiscal_year);

COMMENT ON TABLE fact_hires_by_school IS 'New hire counts aggregated by school/organization';

-- ============================================
-- FACT: Application Sources
-- ============================================
-- Application counts by source channel

CREATE TABLE IF NOT EXISTS fact_application_sources (
    source_record_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    source_name VARCHAR(100) NOT NULL,

    -- Metrics
    application_count INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_app_sources UNIQUE (fiscal_year, fiscal_quarter, source_name)
);

CREATE INDEX idx_app_sources_fy ON fact_application_sources(fiscal_year);

COMMENT ON TABLE fact_application_sources IS 'Application counts by source channel (LinkedIn, Indeed, etc.)';

-- ============================================
-- FACT: Top Jobs
-- ============================================
-- Top positions by application count

CREATE TABLE IF NOT EXISTS fact_top_jobs (
    top_job_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    rank INTEGER NOT NULL,  -- 1-10 typically

    -- Job details
    job_title VARCHAR(200) NOT NULL,
    application_count INTEGER NOT NULL,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_top_jobs UNIQUE (fiscal_year, fiscal_quarter, rank)
);

CREATE INDEX idx_top_jobs_fy ON fact_top_jobs(fiscal_year);

COMMENT ON TABLE fact_top_jobs IS 'Top 10 jobs by application count per quarter';

-- ============================================
-- FACT: Requisition Aging
-- ============================================
-- Distribution of requisitions by time open

CREATE TABLE IF NOT EXISTS fact_requisition_aging (
    aging_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    age_range VARCHAR(20) NOT NULL,  -- '0-30 Days', '31-60 Days', etc.

    -- Metrics
    requisition_count INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2),

    -- Display
    display_color VARCHAR(20),  -- For chart visualization

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_req_aging UNIQUE (fiscal_year, fiscal_quarter, age_range)
);

CREATE INDEX idx_req_aging_fy ON fact_requisition_aging(fiscal_year);

COMMENT ON TABLE fact_requisition_aging IS 'Requisition aging distribution by time buckets';

-- ============================================
-- FACT: New Hire Demographics
-- ============================================
-- Demographics breakdown for new hires

CREATE TABLE IF NOT EXISTS fact_new_hire_demographics (
    demo_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    fiscal_quarter INTEGER NOT NULL,
    demo_type VARCHAR(30) NOT NULL,  -- 'Gender', 'Ethnicity', 'Age Band'
    demo_value VARCHAR(100) NOT NULL,  -- 'Female', 'White', '31-40', etc.

    -- Metrics
    count INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2),

    -- Display
    display_color VARCHAR(20),  -- For chart visualization

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_hire_demographics UNIQUE (fiscal_year, fiscal_quarter, demo_type, demo_value)
);

CREATE INDEX idx_hire_demo_fy ON fact_new_hire_demographics(fiscal_year);
CREATE INDEX idx_hire_demo_type ON fact_new_hire_demographics(demo_type);

COMMENT ON TABLE fact_new_hire_demographics IS 'New hire demographics distribution by type';

-- ============================================
-- FACT: Hiring Trends
-- ============================================
-- Historical quarterly hiring trends

CREATE TABLE IF NOT EXISTS fact_hiring_trends (
    trend_id SERIAL PRIMARY KEY,
    quarter VARCHAR(20) NOT NULL,  -- 'Q1 FY24', 'Q2 FY24', etc.
    fiscal_year VARCHAR(10),  -- Derived: 'FY2024'
    fiscal_quarter INTEGER,  -- Derived: 1, 2, 3, 4

    -- Hire counts
    faculty_hires INTEGER NOT NULL DEFAULT 0,
    staff_hires INTEGER NOT NULL DEFAULT 0,
    total_hires INTEGER NOT NULL DEFAULT 0,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_hiring_trends UNIQUE (quarter)
);

CREATE INDEX idx_hiring_trends_quarter ON fact_hiring_trends(quarter);

COMMENT ON TABLE fact_hiring_trends IS 'Historical quarterly hiring trends for trend analysis';

-- ============================================
-- Summary of Tables Created
-- ============================================
-- Dimension Tables (2):
--   - dim_application_sources
--   - dim_job_families
--
-- Fact Tables (10):
--   - fact_recruiting_summary
--   - fact_hire_rates
--   - fact_pipeline_metrics_staff
--   - fact_pipeline_metrics_faculty
--   - fact_new_hires
--   - fact_hires_by_school
--   - fact_application_sources
--   - fact_top_jobs
--   - fact_requisition_aging
--   - fact_new_hire_demographics
--   - fact_hiring_trends
