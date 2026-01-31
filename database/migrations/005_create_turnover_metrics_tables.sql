-- Migration 005: Create Turnover Metrics Tables
-- HR Reports Neon Postgres Database
-- Stores turnover dashboard metrics from HR slides

-- ============================================
-- FACT: Turnover Summary Rates
-- ============================================
-- Summary turnover rates by fiscal year and category
-- Source: TurnoverDashboard summary cards + TurnoverRatesTable

CREATE TABLE IF NOT EXISTS fact_turnover_summary_rates (
    rate_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,  -- 'FY2025', 'FY2024', etc.
    category VARCHAR(50) NOT NULL,  -- 'Faculty', 'Staff Exempt', 'Staff Non-Exempt', 'Total'

    -- Rate metrics
    turnover_rate NUMERIC(5,2) NOT NULL,
    prior_year_rate NUMERIC(5,2),
    change NUMERIC(5,2),
    trend VARCHAR(20),  -- 'positive', 'negative', 'neutral'

    -- Benchmark data
    higher_ed_avg NUMERIC(5,2),
    benchmark_source VARCHAR(100),  -- 'CUPA 2024-25', etc.

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_turnover_summary_rate UNIQUE (fiscal_year, category)
);

CREATE INDEX idx_turnover_summary_fy ON fact_turnover_summary_rates(fiscal_year);
CREATE INDEX idx_turnover_summary_category ON fact_turnover_summary_rates(category);

COMMENT ON TABLE fact_turnover_summary_rates IS 'Summary turnover rates by fiscal year and category with benchmarks';

-- ============================================
-- FACT: Turnover Breakdown (Vol/Invol/Retire)
-- ============================================
-- Voluntary/Involuntary/Retirement breakdown by category
-- Source: VoluntaryInvoluntaryTurnoverChart

CREATE TABLE IF NOT EXISTS fact_turnover_breakdown (
    breakdown_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,  -- 'Staff Exempt', 'Staff Non-Exempt', 'Faculty'

    -- Breakdown percentages
    involuntary NUMERIC(5,2) NOT NULL DEFAULT 0,
    voluntary NUMERIC(5,2) NOT NULL DEFAULT 0,
    retirement NUMERIC(5,2) NOT NULL DEFAULT 0,
    total NUMERIC(5,2) NOT NULL,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_turnover_breakdown UNIQUE (fiscal_year, category)
);

CREATE INDEX idx_turnover_breakdown_fy ON fact_turnover_breakdown(fiscal_year);

COMMENT ON TABLE fact_turnover_breakdown IS 'Turnover breakdown by type (voluntary/involuntary/retirement)';

-- ============================================
-- FACT: Staff Turnover Deviation
-- ============================================
-- Department-level staff turnover rates
-- Source: TurnoverDeviationChart

CREATE TABLE IF NOT EXISTS fact_staff_turnover_deviation (
    deviation_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    department VARCHAR(100) NOT NULL,

    -- Metrics
    turnover_rate NUMERIC(5,2) NOT NULL,
    is_average BOOLEAN NOT NULL DEFAULT false,
    deviation_from_avg NUMERIC(5,2),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_staff_deviation UNIQUE (fiscal_year, department)
);

CREATE INDEX idx_staff_deviation_fy ON fact_staff_turnover_deviation(fiscal_year);
CREATE INDEX idx_staff_deviation_dept ON fact_staff_turnover_deviation(department);

COMMENT ON TABLE fact_staff_turnover_deviation IS 'Staff turnover by department with deviation from average';

-- ============================================
-- FACT: Faculty Turnover Deviation
-- ============================================
-- School-level faculty turnover rates
-- Source: FacultyTurnoverDeviationChart

CREATE TABLE IF NOT EXISTS fact_faculty_turnover_deviation (
    deviation_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    school VARCHAR(100) NOT NULL,

    -- Metrics
    turnover_rate NUMERIC(5,2) NOT NULL,
    is_average BOOLEAN NOT NULL DEFAULT false,
    deviation_from_avg NUMERIC(5,2),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_faculty_deviation UNIQUE (fiscal_year, school)
);

CREATE INDEX idx_faculty_deviation_fy ON fact_faculty_turnover_deviation(fiscal_year);
CREATE INDEX idx_faculty_deviation_school ON fact_faculty_turnover_deviation(school);

COMMENT ON TABLE fact_faculty_turnover_deviation IS 'Faculty turnover by school with deviation from average';

-- ============================================
-- FACT: Historical Turnover Rates
-- ============================================
-- Multi-year turnover trend data
-- Source: FacultyStaffTurnoverByFYChart

CREATE TABLE IF NOT EXISTS fact_historical_turnover_rates (
    rate_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,

    -- Rates by category
    total_turnover_rate NUMERIC(5,2),
    faculty_rate NUMERIC(5,2),
    staff_exempt_rate NUMERIC(5,2),
    staff_non_exempt_rate NUMERIC(5,2),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_historical_rate UNIQUE (fiscal_year)
);

CREATE INDEX idx_historical_turnover_fy ON fact_historical_turnover_rates(fiscal_year);

COMMENT ON TABLE fact_historical_turnover_rates IS 'Historical turnover rates by fiscal year';

-- ============================================
-- FACT: Turnover Length of Service
-- ============================================
-- Turnover by tenure band
-- Source: TurnoverByLengthOfServiceChart + staticData.js

CREATE TABLE IF NOT EXISTS fact_turnover_length_of_service (
    los_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    employee_type VARCHAR(20) NOT NULL,  -- 'Faculty', 'Staff'
    tenure_band VARCHAR(30) NOT NULL,  -- 'Less Than One', '1 to 5', '5 to 10', '10 to 20', '20 Plus'

    -- Metrics
    percentage NUMERIC(5,2) NOT NULL,
    count INTEGER NOT NULL,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_turnover_los UNIQUE (fiscal_year, employee_type, tenure_band)
);

CREATE INDEX idx_turnover_los_fy ON fact_turnover_length_of_service(fiscal_year);
CREATE INDEX idx_turnover_los_type ON fact_turnover_length_of_service(employee_type);

COMMENT ON TABLE fact_turnover_length_of_service IS 'Turnover rates by length of service/tenure band';

-- ============================================
-- FACT: Retirements by Fiscal Year
-- ============================================
-- Annual retirement counts by category
-- Source: RetirementsByFiscalYear

CREATE TABLE IF NOT EXISTS fact_retirements_by_fy (
    retirement_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,

    -- Counts by category
    faculty INTEGER NOT NULL DEFAULT 0,
    staff_exempt INTEGER NOT NULL DEFAULT 0,
    staff_non_exempt INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_retirements_fy UNIQUE (fiscal_year)
);

CREATE INDEX idx_retirements_fy ON fact_retirements_by_fy(fiscal_year);

COMMENT ON TABLE fact_retirements_by_fy IS 'Retirement counts by fiscal year and employee category';

-- ============================================
-- FACT: Retirement Trends
-- ============================================
-- Retirement age and LOS trends
-- Source: FacultyRetirementAnalysis + StaffRetirementAnalysis

CREATE TABLE IF NOT EXISTS fact_retirement_trends (
    trend_id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    employee_type VARCHAR(20) NOT NULL,  -- 'Faculty', 'Staff'

    -- Average metrics
    avg_age NUMERIC(5,2) NOT NULL,
    avg_los NUMERIC(5,2) NOT NULL,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_retirement_trend UNIQUE (year, employee_type)
);

CREATE INDEX idx_retirement_trend_year ON fact_retirement_trends(year);
CREATE INDEX idx_retirement_trend_type ON fact_retirement_trends(employee_type);

COMMENT ON TABLE fact_retirement_trends IS 'Average retirement age and LOS by year and employee type';

-- ============================================
-- FACT: Retirement Age Distribution
-- ============================================
-- Distribution of employees nearing retirement
-- Source: FacultyRetirementAnalysis + StaffRetirementAnalysis

CREATE TABLE IF NOT EXISTS fact_retirement_age_distribution (
    distribution_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    employee_type VARCHAR(20) NOT NULL,  -- 'Faculty', 'Staff'
    category VARCHAR(30) NOT NULL,  -- 'Under 69', 'Over 69', 'Three-Year', 'Two-Year', 'One-Year'

    -- Metrics
    percentage NUMERIC(5,2) NOT NULL,
    color VARCHAR(20),  -- Chart color code

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_retirement_dist UNIQUE (fiscal_year, employee_type, category)
);

CREATE INDEX idx_retirement_dist_fy ON fact_retirement_age_distribution(fiscal_year);
CREATE INDEX idx_retirement_dist_type ON fact_retirement_age_distribution(employee_type);

COMMENT ON TABLE fact_retirement_age_distribution IS 'Distribution of employees at or nearing retirement age';

-- ============================================
-- FACT: Faculty Retirement by School
-- ============================================
-- Faculty over retirement age by school
-- Source: FacultyRetirementAnalysis

CREATE TABLE IF NOT EXISTS fact_faculty_retirement_by_school (
    school_retirement_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    school VARCHAR(100) NOT NULL,

    -- Count
    count INTEGER NOT NULL,

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_faculty_retire_school UNIQUE (fiscal_year, school)
);

CREATE INDEX idx_faculty_retire_school_fy ON fact_faculty_retirement_by_school(fiscal_year);

COMMENT ON TABLE fact_faculty_retirement_by_school IS 'Count of faculty at/over retirement age by school';

-- ============================================
-- FACT: Higher Ed Benchmark Averages
-- ============================================
-- CUPA and other benchmark data by year
-- Source: TurnoverRatesTable

CREATE TABLE IF NOT EXISTS fact_higher_ed_benchmarks (
    benchmark_id SERIAL PRIMARY KEY,
    fiscal_year VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL,  -- 'Faculty', 'Staff Exempt', 'Staff Non-Exempt', 'Total'

    -- Benchmark value
    higher_ed_avg NUMERIC(5,2) NOT NULL,
    source VARCHAR(100),  -- 'CUPA 2024-25', etc.

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_higher_ed_benchmark UNIQUE (fiscal_year, category)
);

CREATE INDEX idx_benchmark_fy ON fact_higher_ed_benchmarks(fiscal_year);

COMMENT ON TABLE fact_higher_ed_benchmarks IS 'Higher education benchmark turnover rates by category';
