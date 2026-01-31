-- Migration 004: Create Demographics Tables
-- HR Reports Neon Postgres Database
-- Fact table for workforce demographics (gender, ethnicity, age bands)

-- ============================================
-- FACT: Workforce Demographics
-- ============================================
-- Demographic breakdown for benefit-eligible employees
-- Aggregated by period, location, category (faculty/staff), and demographic type

CREATE TABLE IF NOT EXISTS fact_workforce_demographics (
    demo_id SERIAL PRIMARY KEY,
    period_date DATE NOT NULL REFERENCES dim_fiscal_periods(period_date),
    location VARCHAR(20) NOT NULL CHECK (location IN ('omaha', 'phoenix', 'combined')),
    category_type VARCHAR(20) NOT NULL CHECK (category_type IN ('faculty', 'staff')),
    demographic_type VARCHAR(20) NOT NULL CHECK (demographic_type IN ('gender', 'ethnicity', 'age_band')),
    demographic_value VARCHAR(100) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2),

    -- Audit fields
    source_file VARCHAR(255),
    loaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint for upserts
    -- Each combination of period/location/category/type/value is unique
    CONSTRAINT uq_workforce_demo UNIQUE (
      period_date, location, category_type, demographic_type, demographic_value
    )
);

-- Indexes for common query patterns
CREATE INDEX idx_fact_demo_period ON fact_workforce_demographics(period_date);
CREATE INDEX idx_fact_demo_type ON fact_workforce_demographics(demographic_type);
CREATE INDEX idx_fact_demo_category ON fact_workforce_demographics(category_type);
CREATE INDEX idx_fact_demo_location ON fact_workforce_demographics(location);
CREATE INDEX idx_fact_demo_period_type ON fact_workforce_demographics(period_date, demographic_type);
CREATE INDEX idx_fact_demo_category_type ON fact_workforce_demographics(category_type, demographic_type);

-- Comments for documentation
COMMENT ON TABLE fact_workforce_demographics IS 'Demographic breakdowns for benefit-eligible faculty and staff';
COMMENT ON COLUMN fact_workforce_demographics.period_date IS 'Reporting date (typically quarter-end)';
COMMENT ON COLUMN fact_workforce_demographics.location IS 'Campus location: omaha, phoenix, or combined';
COMMENT ON COLUMN fact_workforce_demographics.category_type IS 'Employee category: faculty or staff';
COMMENT ON COLUMN fact_workforce_demographics.demographic_type IS 'Demographic dimension: gender, ethnicity, or age_band';
COMMENT ON COLUMN fact_workforce_demographics.demographic_value IS 'Value within the demographic type (e.g., M, F, White, 31-40)';
COMMENT ON COLUMN fact_workforce_demographics.count IS 'Number of employees with this demographic value';
COMMENT ON COLUMN fact_workforce_demographics.percentage IS 'Percentage within category (e.g., 46.59% of faculty are male)';
COMMENT ON COLUMN fact_workforce_demographics.source_file IS 'Original Excel file this data came from';

-- ============================================
-- VIEW: Workforce Demographics Summary
-- ============================================
-- Provides demographics data in a format compatible with staticData.js

CREATE OR REPLACE VIEW v_workforce_demographics AS
SELECT
    d.demo_id,
    d.period_date,
    fp.fiscal_year,
    fp.fiscal_quarter,
    fp.quarter_label,
    d.location,
    d.category_type,
    d.demographic_type,
    d.demographic_value,
    d.count,
    d.percentage,
    d.source_file,
    d.loaded_at
FROM fact_workforce_demographics d
JOIN dim_fiscal_periods fp ON fp.period_date = d.period_date
ORDER BY
    d.period_date DESC,
    d.demographic_type,
    d.category_type,
    d.count DESC;

COMMENT ON VIEW v_workforce_demographics IS 'Demographics view with fiscal period labels for API responses';

-- ============================================
-- VIEW: Demographics Gender Summary
-- ============================================
-- Pivoted view for gender data matching staticData.js format

CREATE OR REPLACE VIEW v_demographics_gender AS
SELECT
    period_date,
    category_type,
    location,
    SUM(CASE WHEN demographic_value = 'M' THEN count ELSE 0 END) as male,
    SUM(CASE WHEN demographic_value = 'F' THEN count ELSE 0 END) as female,
    SUM(count) as total
FROM fact_workforce_demographics
WHERE demographic_type = 'gender'
GROUP BY period_date, category_type, location
ORDER BY period_date DESC, category_type, location;

COMMENT ON VIEW v_demographics_gender IS 'Gender breakdown pivoted by category and location';

-- ============================================
-- VIEW: Demographics Age Bands Summary
-- ============================================
-- Pivoted view for age band data

CREATE OR REPLACE VIEW v_demographics_age_bands AS
SELECT
    period_date,
    category_type,
    location,
    SUM(CASE WHEN demographic_value = '20-30' THEN count ELSE 0 END) as age_20_30,
    SUM(CASE WHEN demographic_value = '31-40' THEN count ELSE 0 END) as age_31_40,
    SUM(CASE WHEN demographic_value = '41-50' THEN count ELSE 0 END) as age_41_50,
    SUM(CASE WHEN demographic_value = '51-60' THEN count ELSE 0 END) as age_51_60,
    SUM(CASE WHEN demographic_value = '61 Plus' THEN count ELSE 0 END) as age_61_plus,
    SUM(count) as total
FROM fact_workforce_demographics
WHERE demographic_type = 'age_band'
GROUP BY period_date, category_type, location
ORDER BY period_date DESC, category_type, location;

COMMENT ON VIEW v_demographics_age_bands IS 'Age band breakdown pivoted by category and location';

-- ============================================
-- VIEW: Demographics Totals
-- ============================================
-- Combined totals for validation

CREATE OR REPLACE VIEW v_demographics_totals AS
SELECT
    period_date,
    category_type,
    demographic_type,
    SUM(count) as total_count
FROM fact_workforce_demographics
WHERE location = 'combined'
GROUP BY period_date, category_type, demographic_type
ORDER BY period_date DESC, category_type, demographic_type;

COMMENT ON VIEW v_demographics_totals IS 'Aggregated totals for validation against JSON data';
