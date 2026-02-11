-- Migration 007: Employee State Residence Tables
-- HR Reports Neon Postgres Database
-- Tracks benefit-eligible employee counts by state of residence per quarter

-- ============================================
-- DIMENSION: US States
-- ============================================
-- All 50 states + DC with FIPS codes for map rendering

CREATE TABLE IF NOT EXISTS dim_us_states (
    state_code CHAR(2) PRIMARY KEY,
    state_name VARCHAR(50) NOT NULL,
    fips_code CHAR(2) NOT NULL UNIQUE
);

-- Comments
COMMENT ON TABLE dim_us_states IS 'US states dimension table with FIPS codes for choropleth map rendering';
COMMENT ON COLUMN dim_us_states.state_code IS 'Two-letter USPS state abbreviation (e.g., NE, AZ)';
COMMENT ON COLUMN dim_us_states.fips_code IS 'Two-digit FIPS state code used by US Census/TopoJSON';

-- ============================================
-- FACT: Employee State Residence
-- ============================================
-- Quarterly count of benefit-eligible employees by state of residence
-- Manually entered each quarter by HR

CREATE TABLE IF NOT EXISTS fact_employee_state_residence (
    residence_id SERIAL PRIMARY KEY,
    period_date DATE NOT NULL REFERENCES dim_fiscal_periods(period_date),
    state_code CHAR(2) NOT NULL REFERENCES dim_us_states(state_code),

    -- Metric
    employee_count INTEGER NOT NULL DEFAULT 0 CHECK (employee_count >= 0),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint for upserts (one count per state per quarter)
    CONSTRAINT uq_employee_state_residence UNIQUE (period_date, state_code)
);

-- Indexes for common query patterns
CREATE INDEX idx_fact_state_residence_period ON fact_employee_state_residence(period_date);
CREATE INDEX idx_fact_state_residence_state ON fact_employee_state_residence(state_code);
CREATE INDEX idx_fact_state_residence_count ON fact_employee_state_residence(employee_count);

-- Comments
COMMENT ON TABLE fact_employee_state_residence IS 'Quarterly benefit-eligible employee counts by state of residence';
COMMENT ON COLUMN fact_employee_state_residence.period_date IS 'Quarter-end date (e.g., 2025-09-30 for Q1 FY26)';
COMMENT ON COLUMN fact_employee_state_residence.employee_count IS 'Number of benefit-eligible employees residing in this state';

-- ============================================
-- VIEW: Employee State Residence (joined)
-- ============================================
-- Convenience view joining fact + dim tables + fiscal periods

CREATE OR REPLACE VIEW v_employee_state_residence AS
SELECT
    f.period_date,
    fp.fiscal_year,
    fp.fiscal_quarter,
    fp.quarter_label,
    f.state_code,
    s.state_name,
    s.fips_code,
    f.employee_count,
    f.source_file,
    f.loaded_at
FROM fact_employee_state_residence f
JOIN dim_us_states s ON f.state_code = s.state_code
JOIN dim_fiscal_periods fp ON f.period_date = fp.period_date
ORDER BY f.period_date DESC, f.employee_count DESC;

COMMENT ON VIEW v_employee_state_residence IS 'Employee residence by state with fiscal period and state details';
