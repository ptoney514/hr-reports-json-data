-- Migration 002: Create Fact Tables
-- HR Reports Neon Postgres Database
-- Fact tables store transactional/event data

-- ============================================
-- FACT: Workforce Snapshots
-- ============================================
-- Point-in-time headcount data by period, location, school, category
-- Each row represents headcount for a specific combination at a reporting date

CREATE TABLE IF NOT EXISTS fact_workforce_snapshots (
    snapshot_id SERIAL PRIMARY KEY,
    period_date DATE NOT NULL REFERENCES dim_fiscal_periods(period_date),
    location VARCHAR(20) NOT NULL CHECK (location IN ('omaha', 'phoenix')),
    school_id INTEGER REFERENCES dim_schools(school_id),
    category_code VARCHAR(10) REFERENCES dim_assignment_categories(category_code),

    -- Headcount metrics
    headcount INTEGER NOT NULL DEFAULT 0,
    faculty_count INTEGER NOT NULL DEFAULT 0,
    staff_count INTEGER NOT NULL DEFAULT 0,
    hsp_count INTEGER NOT NULL DEFAULT 0,
    student_count INTEGER NOT NULL DEFAULT 0,
    temp_count INTEGER NOT NULL DEFAULT 0,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint for upserts
    CONSTRAINT uq_workforce_snapshot UNIQUE (period_date, location, school_id, category_code)
);

-- Indexes for common query patterns
CREATE INDEX idx_fact_workforce_period ON fact_workforce_snapshots(period_date);
CREATE INDEX idx_fact_workforce_location ON fact_workforce_snapshots(location);
CREATE INDEX idx_fact_workforce_school ON fact_workforce_snapshots(school_id);
CREATE INDEX idx_fact_workforce_category ON fact_workforce_snapshots(category_code);
CREATE INDEX idx_fact_workforce_period_location ON fact_workforce_snapshots(period_date, location);

-- Comments
COMMENT ON TABLE fact_workforce_snapshots IS 'Point-in-time headcount snapshots - one row per period/location/school/category combination';
COMMENT ON COLUMN fact_workforce_snapshots.period_date IS 'Reporting date (typically quarter-end)';
COMMENT ON COLUMN fact_workforce_snapshots.source_file IS 'Original Excel file this data came from';

-- ============================================
-- FACT: Terminations
-- ============================================
-- Individual termination records with denormalized details for reporting

CREATE TABLE IF NOT EXISTS fact_terminations (
    termination_id SERIAL PRIMARY KEY,
    employee_hash VARCHAR(20) NOT NULL,  -- SHA-256 hash of employee ID (first 12 chars)
    period_date DATE NOT NULL REFERENCES dim_fiscal_periods(period_date),
    termination_date DATE NOT NULL,

    -- Location/organization
    location VARCHAR(20) CHECK (location IN ('omaha', 'phoenix')),
    school_id INTEGER REFERENCES dim_schools(school_id),
    department_id INTEGER REFERENCES dim_departments(department_id),
    category_code VARCHAR(10) REFERENCES dim_assignment_categories(category_code),

    -- Termination details
    reason_id INTEGER REFERENCES dim_term_reasons(reason_id),
    reason_raw VARCHAR(200),  -- Original reason text from Oracle
    termination_type VARCHAR(20) NOT NULL CHECK (termination_type IN ('voluntary', 'involuntary', 'retirement')),
    is_voluntary BOOLEAN NOT NULL,

    -- Tenure
    hire_date DATE,
    years_of_service NUMERIC(5,2),
    tenure_bucket VARCHAR(20),  -- '<1yr', '1-3yr', '3-5yr', '5-10yr', '10+yr'

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint (employee can only terminate once per date)
    CONSTRAINT uq_termination UNIQUE (employee_hash, termination_date)
);

-- Indexes
CREATE INDEX idx_fact_terminations_period ON fact_terminations(period_date);
CREATE INDEX idx_fact_terminations_date ON fact_terminations(termination_date);
CREATE INDEX idx_fact_terminations_location ON fact_terminations(location);
CREATE INDEX idx_fact_terminations_school ON fact_terminations(school_id);
CREATE INDEX idx_fact_terminations_type ON fact_terminations(termination_type);
CREATE INDEX idx_fact_terminations_reason ON fact_terminations(reason_id);
CREATE INDEX idx_fact_terminations_voluntary ON fact_terminations(is_voluntary);
CREATE INDEX idx_fact_terminations_tenure ON fact_terminations(tenure_bucket);
CREATE INDEX idx_fact_terminations_fy ON fact_terminations(period_date, location);

-- Comments
COMMENT ON TABLE fact_terminations IS 'Individual termination events with PII-hashed employee IDs';
COMMENT ON COLUMN fact_terminations.employee_hash IS 'SHA-256 hash of employee ID (first 12 chars) for tracking without PII';
COMMENT ON COLUMN fact_terminations.tenure_bucket IS 'Tenure grouping: <1yr, 1-3yr, 3-5yr, 5-10yr, 10+yr';
COMMENT ON COLUMN fact_terminations.reason_raw IS 'Original termination reason from Oracle HCM';

-- ============================================
-- FACT: Exit Surveys
-- ============================================
-- Exit survey responses linked to terminations

CREATE TABLE IF NOT EXISTS fact_exit_surveys (
    survey_id SERIAL PRIMARY KEY,
    employee_hash VARCHAR(20) NOT NULL,
    period_date DATE NOT NULL REFERENCES dim_fiscal_periods(period_date),
    survey_date DATE,

    -- Link to termination (if found)
    termination_id INTEGER REFERENCES fact_terminations(termination_id),

    -- Survey dimensions (1-5 scale typically)
    career_development NUMERIC(3,2),
    management_support NUMERIC(3,2),
    work_life_balance NUMERIC(3,2),
    compensation NUMERIC(3,2),
    benefits NUMERIC(3,2),
    job_satisfaction NUMERIC(3,2),
    overall_satisfaction NUMERIC(3,2),

    -- Binary questions
    would_recommend BOOLEAN,
    conduct_concerns BOOLEAN,

    -- Qualitative (counts/flags, not text)
    has_comments BOOLEAN NOT NULL DEFAULT false,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_exit_survey UNIQUE (employee_hash, period_date)
);

-- Indexes
CREATE INDEX idx_fact_exit_surveys_period ON fact_exit_surveys(period_date);
CREATE INDEX idx_fact_exit_surveys_termination ON fact_exit_surveys(termination_id);
CREATE INDEX idx_fact_exit_surveys_recommend ON fact_exit_surveys(would_recommend);

-- Comments
COMMENT ON TABLE fact_exit_surveys IS 'Exit survey responses - numeric scores only, no free-text to avoid PII';
COMMENT ON COLUMN fact_exit_surveys.termination_id IS 'Link to fact_terminations if matched by employee_hash and date';

-- ============================================
-- FACT: Internal Mobility Events
-- ============================================
-- Promotions, transfers, demotions, reclassifications

CREATE TABLE IF NOT EXISTS fact_mobility_events (
    event_id SERIAL PRIMARY KEY,
    employee_hash VARCHAR(20) NOT NULL,
    period_date DATE NOT NULL REFERENCES dim_fiscal_periods(period_date),
    effective_date DATE NOT NULL,

    -- Action type
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('promotion', 'transfer', 'demotion', 'reclassification', 'lateral')),
    reason_code VARCHAR(50),

    -- Before state
    before_school_id INTEGER REFERENCES dim_schools(school_id),
    before_department_id INTEGER REFERENCES dim_departments(department_id),
    before_grade_code VARCHAR(20),
    before_job_family VARCHAR(50),

    -- After state
    after_school_id INTEGER REFERENCES dim_schools(school_id),
    after_department_id INTEGER REFERENCES dim_departments(department_id),
    after_grade_code VARCHAR(20),
    after_job_family VARCHAR(50),

    -- Flags
    is_cross_school BOOLEAN NOT NULL DEFAULT false,
    is_cross_department BOOLEAN NOT NULL DEFAULT false,
    grade_change INTEGER,  -- Positive for promotion, negative for demotion

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_mobility_event UNIQUE (employee_hash, effective_date, action_type)
);

-- Indexes
CREATE INDEX idx_fact_mobility_period ON fact_mobility_events(period_date);
CREATE INDEX idx_fact_mobility_date ON fact_mobility_events(effective_date);
CREATE INDEX idx_fact_mobility_type ON fact_mobility_events(action_type);
CREATE INDEX idx_fact_mobility_cross_school ON fact_mobility_events(is_cross_school);
CREATE INDEX idx_fact_mobility_before_school ON fact_mobility_events(before_school_id);
CREATE INDEX idx_fact_mobility_after_school ON fact_mobility_events(after_school_id);

-- Comments
COMMENT ON TABLE fact_mobility_events IS 'Internal mobility events - promotions, transfers, demotions, reclassifications';
COMMENT ON COLUMN fact_mobility_events.grade_change IS 'Change in grade level (positive=promotion, negative=demotion, 0=lateral)';
COMMENT ON COLUMN fact_mobility_events.is_cross_school IS 'True if employee moved between schools/orgs';

-- ============================================
-- AUDIT: Data Loads
-- ============================================
-- Track all data loads for debugging and auditing

CREATE TABLE IF NOT EXISTS audit_data_loads (
    load_id SERIAL PRIMARY KEY,
    load_type VARCHAR(50) NOT NULL,  -- 'workforce', 'terminations', 'exit_surveys', 'mobility'
    source_file VARCHAR(255),
    period_date DATE,
    fiscal_period VARCHAR(20),

    -- Counts
    records_read INTEGER NOT NULL DEFAULT 0,
    records_inserted INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_errored INTEGER NOT NULL DEFAULT 0,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed', 'failed')),
    error_message TEXT,

    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_audit_loads_type ON audit_data_loads(load_type);
CREATE INDEX idx_audit_loads_period ON audit_data_loads(period_date);
CREATE INDEX idx_audit_loads_status ON audit_data_loads(status);
CREATE INDEX idx_audit_loads_started ON audit_data_loads(started_at);

-- Comments
COMMENT ON TABLE audit_data_loads IS 'Audit trail of all data loads - who, when, what, how many';
