-- Migration 001: Create Dimension Tables
-- HR Reports Neon Postgres Database
-- These are lookup/reference tables that rarely change

-- ============================================
-- DIMENSION: Assignment Categories
-- ============================================
-- Maps category codes to descriptions and types
-- Examples: F12 (Faculty 12-month), PT12 (Part-time 12-month), SUE (Student Worker)

CREATE TABLE IF NOT EXISTS dim_assignment_categories (
    category_code VARCHAR(10) PRIMARY KEY,
    description VARCHAR(100) NOT NULL,
    is_benefit_eligible BOOLEAN NOT NULL DEFAULT false,
    category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('faculty', 'staff', 'student', 'hsp', 'temp', 'other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dim_assignment_categories_type ON dim_assignment_categories(category_type);
CREATE INDEX idx_dim_assignment_categories_benefit_eligible ON dim_assignment_categories(is_benefit_eligible);

-- Comments
COMMENT ON TABLE dim_assignment_categories IS 'Assignment category reference table - maps Oracle HCM codes to HR reporting categories';
COMMENT ON COLUMN dim_assignment_categories.category_code IS 'Oracle HCM assignment category code (e.g., F12, PT12, SUE)';
COMMENT ON COLUMN dim_assignment_categories.is_benefit_eligible IS 'Whether this category is eligible for benefits';
COMMENT ON COLUMN dim_assignment_categories.category_type IS 'HR reporting category: faculty, staff, student, hsp, temp, other';

-- ============================================
-- DIMENSION: Schools/Organizations
-- ============================================
-- Schools, colleges, and VP areas at Creighton

CREATE TABLE IF NOT EXISTS dim_schools (
    school_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    location VARCHAR(20) NOT NULL DEFAULT 'omaha' CHECK (location IN ('omaha', 'phoenix', 'both')),
    is_academic BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dim_schools_code ON dim_schools(code);
CREATE INDEX idx_dim_schools_location ON dim_schools(location);
CREATE INDEX idx_dim_schools_sort_order ON dim_schools(sort_order);

-- Comments
COMMENT ON TABLE dim_schools IS 'Schools, colleges, and VP areas - organizational units for headcount reporting';
COMMENT ON COLUMN dim_schools.code IS 'Short code for the school/org (e.g., CCAS, SOM, HCOB)';
COMMENT ON COLUMN dim_schools.location IS 'Primary campus location: omaha, phoenix, or both';

-- ============================================
-- DIMENSION: Departments
-- ============================================
-- Departments within schools

CREATE TABLE IF NOT EXISTS dim_departments (
    department_id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(150) NOT NULL,
    school_id INTEGER REFERENCES dim_schools(school_id),
    location VARCHAR(20) CHECK (location IN ('omaha', 'phoenix')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dim_departments_school_id ON dim_departments(school_id);
CREATE INDEX idx_dim_departments_location ON dim_departments(location);
CREATE INDEX idx_dim_departments_active ON dim_departments(is_active);

-- Comments
COMMENT ON TABLE dim_departments IS 'Departments within schools - detailed organizational structure';

-- ============================================
-- DIMENSION: Termination Reasons
-- ============================================
-- Normalized termination reason codes

CREATE TABLE IF NOT EXISTS dim_term_reasons (
    reason_id SERIAL PRIMARY KEY,
    reason_code VARCHAR(50) UNIQUE NOT NULL,
    reason_label VARCHAR(100) NOT NULL,
    reason_category VARCHAR(30) NOT NULL CHECK (reason_category IN ('voluntary', 'involuntary', 'retirement', 'other')),
    is_voluntary BOOLEAN NOT NULL,
    display_order INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dim_term_reasons_category ON dim_term_reasons(reason_category);
CREATE INDEX idx_dim_term_reasons_voluntary ON dim_term_reasons(is_voluntary);

-- Comments
COMMENT ON TABLE dim_term_reasons IS 'Normalized termination reasons - maps raw Oracle HCM reasons to reporting categories';
COMMENT ON COLUMN dim_term_reasons.reason_category IS 'High-level category: voluntary, involuntary, retirement, other';
COMMENT ON COLUMN dim_term_reasons.is_voluntary IS 'True if employee chose to leave (voluntary/retirement)';

-- ============================================
-- DIMENSION: Fiscal Periods
-- ============================================
-- Pre-populated fiscal year/quarter reference
-- Creighton fiscal year: July 1 - June 30

CREATE TABLE IF NOT EXISTS dim_fiscal_periods (
    period_date DATE PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    fiscal_quarter INTEGER NOT NULL CHECK (fiscal_quarter BETWEEN 1 AND 4),
    quarter_start DATE NOT NULL,
    quarter_end DATE NOT NULL,
    quarter_label VARCHAR(10) NOT NULL,
    is_quarter_end BOOLEAN NOT NULL DEFAULT false,
    is_year_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dim_fiscal_periods_fy ON dim_fiscal_periods(fiscal_year);
CREATE INDEX idx_dim_fiscal_periods_quarter ON dim_fiscal_periods(fiscal_year, fiscal_quarter);
CREATE INDEX idx_dim_fiscal_periods_quarter_end ON dim_fiscal_periods(is_quarter_end);

-- Comments
COMMENT ON TABLE dim_fiscal_periods IS 'Fiscal calendar reference - maps dates to fiscal years and quarters';
COMMENT ON COLUMN dim_fiscal_periods.period_date IS 'Date being mapped (typically quarter-end dates like 9/30, 12/31, 3/31, 6/30)';
COMMENT ON COLUMN dim_fiscal_periods.fiscal_year IS 'Fiscal year (e.g., 2025 for FY25)';
COMMENT ON COLUMN dim_fiscal_periods.quarter_label IS 'Quarter label (e.g., FY25_Q1, FY25_Q2)';

-- ============================================
-- TRIGGERS: Auto-update timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dim_assignment_categories_updated_at
    BEFORE UPDATE ON dim_assignment_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_schools_updated_at
    BEFORE UPDATE ON dim_schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_departments_updated_at
    BEFORE UPDATE ON dim_departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dim_term_reasons_updated_at
    BEFORE UPDATE ON dim_term_reasons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
