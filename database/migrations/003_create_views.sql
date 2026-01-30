-- Migration 003: Create Views
-- HR Reports Neon Postgres Database
-- Views that replace the current getter functions in staticData.js

-- ============================================
-- VIEW: Workforce Summary
-- Replaces: getWorkforceData(date)
-- ============================================

CREATE OR REPLACE VIEW v_workforce_summary AS
SELECT
    fp.period_date,
    fp.fiscal_year,
    fp.fiscal_quarter,
    fp.quarter_label,

    -- Total headcount
    COALESCE(SUM(ws.headcount), 0) AS total_employees,

    -- By category
    COALESCE(SUM(ws.faculty_count), 0) AS faculty,
    COALESCE(SUM(ws.staff_count), 0) AS staff,
    COALESCE(SUM(ws.hsp_count), 0) AS hsp,
    COALESCE(SUM(ws.student_count), 0) AS students,
    COALESCE(SUM(ws.temp_count), 0) AS temp,

    -- By location
    COALESCE(SUM(CASE WHEN ws.location = 'omaha' THEN ws.headcount ELSE 0 END), 0) AS omaha_total,
    COALESCE(SUM(CASE WHEN ws.location = 'phoenix' THEN ws.headcount ELSE 0 END), 0) AS phoenix_total,

    -- Location details - Omaha
    COALESCE(SUM(CASE WHEN ws.location = 'omaha' THEN ws.faculty_count ELSE 0 END), 0) AS omaha_faculty,
    COALESCE(SUM(CASE WHEN ws.location = 'omaha' THEN ws.staff_count ELSE 0 END), 0) AS omaha_staff,
    COALESCE(SUM(CASE WHEN ws.location = 'omaha' THEN ws.hsp_count ELSE 0 END), 0) AS omaha_hsp,
    COALESCE(SUM(CASE WHEN ws.location = 'omaha' THEN ws.student_count ELSE 0 END), 0) AS omaha_students,

    -- Location details - Phoenix
    COALESCE(SUM(CASE WHEN ws.location = 'phoenix' THEN ws.faculty_count ELSE 0 END), 0) AS phoenix_faculty,
    COALESCE(SUM(CASE WHEN ws.location = 'phoenix' THEN ws.staff_count ELSE 0 END), 0) AS phoenix_staff,
    COALESCE(SUM(CASE WHEN ws.location = 'phoenix' THEN ws.hsp_count ELSE 0 END), 0) AS phoenix_hsp,
    COALESCE(SUM(CASE WHEN ws.location = 'phoenix' THEN ws.student_count ELSE 0 END), 0) AS phoenix_students

FROM dim_fiscal_periods fp
LEFT JOIN fact_workforce_snapshots ws ON ws.period_date = fp.period_date
WHERE fp.is_quarter_end = true
GROUP BY fp.period_date, fp.fiscal_year, fp.fiscal_quarter, fp.quarter_label
ORDER BY fp.period_date DESC;

COMMENT ON VIEW v_workforce_summary IS 'Workforce headcount summary by period - replaces getWorkforceData()';

-- ============================================
-- VIEW: School/Org Headcount
-- Replaces: getTop15SchoolOrgData(date)
-- ============================================

CREATE OR REPLACE VIEW v_school_org_headcount AS
SELECT
    ws.period_date,
    s.school_id,
    s.code AS school_code,
    s.name AS school_name,
    s.short_name,
    s.location AS primary_location,

    -- Totals
    COALESCE(SUM(ws.headcount), 0) AS total,
    COALESCE(SUM(ws.faculty_count), 0) AS faculty,
    COALESCE(SUM(ws.staff_count), 0) AS staff,
    COALESCE(SUM(ws.hsp_count), 0) AS hsp,

    -- Rank within period
    RANK() OVER (PARTITION BY ws.period_date ORDER BY SUM(ws.headcount) DESC) AS headcount_rank

FROM fact_workforce_snapshots ws
JOIN dim_schools s ON s.school_id = ws.school_id
GROUP BY ws.period_date, s.school_id, s.code, s.name, s.short_name, s.location
ORDER BY ws.period_date DESC, total DESC;

COMMENT ON VIEW v_school_org_headcount IS 'Headcount by school/org with ranking - replaces getTop15SchoolOrgData()';

-- ============================================
-- VIEW: Assignment Category Breakdown
-- ============================================

CREATE OR REPLACE VIEW v_category_breakdown AS
SELECT
    ws.period_date,
    ac.category_code,
    ac.description,
    ac.category_type,
    ac.is_benefit_eligible,

    COALESCE(SUM(ws.headcount), 0) AS headcount,
    ROUND(
        100.0 * SUM(ws.headcount) / NULLIF(SUM(SUM(ws.headcount)) OVER (PARTITION BY ws.period_date), 0),
        1
    ) AS percentage

FROM fact_workforce_snapshots ws
JOIN dim_assignment_categories ac ON ac.category_code = ws.category_code
GROUP BY ws.period_date, ac.category_code, ac.description, ac.category_type, ac.is_benefit_eligible
ORDER BY ws.period_date DESC, headcount DESC;

COMMENT ON VIEW v_category_breakdown IS 'Headcount by assignment category with percentages';

-- ============================================
-- VIEW: Turnover Summary
-- Replaces: getTurnoverData(date)
-- ============================================

CREATE OR REPLACE VIEW v_turnover_summary AS
SELECT
    fp.period_date,
    fp.fiscal_year,
    fp.fiscal_quarter,
    fp.quarter_label,

    -- Total terminations
    COUNT(t.termination_id) AS total_terminations,

    -- By type
    COUNT(CASE WHEN t.termination_type = 'voluntary' THEN 1 END) AS voluntary_count,
    COUNT(CASE WHEN t.termination_type = 'involuntary' THEN 1 END) AS involuntary_count,
    COUNT(CASE WHEN t.termination_type = 'retirement' THEN 1 END) AS retirement_count,

    -- Percentages
    ROUND(100.0 * COUNT(CASE WHEN t.termination_type = 'voluntary' THEN 1 END) / NULLIF(COUNT(*), 0), 1) AS voluntary_pct,
    ROUND(100.0 * COUNT(CASE WHEN t.termination_type = 'involuntary' THEN 1 END) / NULLIF(COUNT(*), 0), 1) AS involuntary_pct,
    ROUND(100.0 * COUNT(CASE WHEN t.termination_type = 'retirement' THEN 1 END) / NULLIF(COUNT(*), 0), 1) AS retirement_pct,

    -- By location
    COUNT(CASE WHEN t.location = 'omaha' THEN 1 END) AS omaha_count,
    COUNT(CASE WHEN t.location = 'phoenix' THEN 1 END) AS phoenix_count,

    -- Tenure stats
    ROUND(AVG(t.years_of_service), 1) AS avg_tenure_years,
    COUNT(CASE WHEN t.tenure_bucket = '<1yr' THEN 1 END) AS tenure_under_1yr,
    COUNT(CASE WHEN t.tenure_bucket = '1-3yr' THEN 1 END) AS tenure_1_3yr,
    COUNT(CASE WHEN t.tenure_bucket = '3-5yr' THEN 1 END) AS tenure_3_5yr,
    COUNT(CASE WHEN t.tenure_bucket = '5-10yr' THEN 1 END) AS tenure_5_10yr,
    COUNT(CASE WHEN t.tenure_bucket = '10+yr' THEN 1 END) AS tenure_10plus_yr

FROM dim_fiscal_periods fp
LEFT JOIN fact_terminations t ON t.period_date = fp.period_date
WHERE fp.is_quarter_end = true
GROUP BY fp.period_date, fp.fiscal_year, fp.fiscal_quarter, fp.quarter_label
ORDER BY fp.period_date DESC;

COMMENT ON VIEW v_turnover_summary IS 'Turnover metrics by period - replaces getTurnoverData()';

-- ============================================
-- VIEW: Annual Turnover Rates
-- Replaces: getAnnualTurnoverRatesByCategory()
-- ============================================

CREATE OR REPLACE VIEW v_turnover_rates AS
WITH annual_terms AS (
    SELECT
        EXTRACT(YEAR FROM t.termination_date) AS term_year,
        t.termination_type,
        COUNT(*) AS term_count
    FROM fact_terminations t
    WHERE t.termination_type = 'voluntary'
    GROUP BY EXTRACT(YEAR FROM t.termination_date), t.termination_type
),
annual_headcount AS (
    SELECT
        fp.fiscal_year,
        AVG(ws.headcount) AS avg_headcount
    FROM fact_workforce_snapshots ws
    JOIN dim_fiscal_periods fp ON fp.period_date = ws.period_date
    JOIN dim_assignment_categories ac ON ac.category_code = ws.category_code
    WHERE ac.is_benefit_eligible = true  -- Only benefit-eligible employees
    GROUP BY fp.fiscal_year
)
SELECT
    h.fiscal_year,
    t.term_count AS voluntary_terminations,
    ROUND(h.avg_headcount, 0) AS avg_benefit_eligible_headcount,
    ROUND(100.0 * t.term_count / NULLIF(h.avg_headcount, 0), 1) AS voluntary_turnover_rate
FROM annual_headcount h
LEFT JOIN annual_terms t ON t.term_year = h.fiscal_year
ORDER BY h.fiscal_year DESC;

COMMENT ON VIEW v_turnover_rates IS 'Annual voluntary turnover rates with benchmarks - replaces getAnnualTurnoverRatesByCategory()';

-- ============================================
-- VIEW: Exit Survey Metrics
-- Replaces: getExitSurveyData(date)
-- ============================================

CREATE OR REPLACE VIEW v_exit_survey_metrics AS
SELECT
    fp.period_date,
    fp.fiscal_year,
    fp.fiscal_quarter,
    fp.quarter_label,

    -- Response counts
    COUNT(es.survey_id) AS total_responses,

    -- Link to terminations for response rate
    (SELECT COUNT(*) FROM fact_terminations t WHERE t.period_date = fp.period_date) AS total_terminations,
    ROUND(
        100.0 * COUNT(es.survey_id) / NULLIF((SELECT COUNT(*) FROM fact_terminations t WHERE t.period_date = fp.period_date), 0),
        1
    ) AS response_rate,

    -- Average scores (1-5 scale typically)
    ROUND(AVG(es.career_development), 2) AS avg_career_development,
    ROUND(AVG(es.management_support), 2) AS avg_management_support,
    ROUND(AVG(es.work_life_balance), 2) AS avg_work_life_balance,
    ROUND(AVG(es.compensation), 2) AS avg_compensation,
    ROUND(AVG(es.benefits), 2) AS avg_benefits,
    ROUND(AVG(es.job_satisfaction), 2) AS avg_job_satisfaction,
    ROUND(AVG(es.overall_satisfaction), 2) AS avg_overall,

    -- Binary metrics
    COUNT(CASE WHEN es.would_recommend = true THEN 1 END) AS would_recommend_count,
    ROUND(100.0 * COUNT(CASE WHEN es.would_recommend = true THEN 1 END) / NULLIF(COUNT(*), 0), 1) AS would_recommend_pct,
    COUNT(CASE WHEN es.conduct_concerns = true THEN 1 END) AS conduct_concerns_count

FROM dim_fiscal_periods fp
LEFT JOIN fact_exit_surveys es ON es.period_date = fp.period_date
WHERE fp.is_quarter_end = true
GROUP BY fp.period_date, fp.fiscal_year, fp.fiscal_quarter, fp.quarter_label
ORDER BY fp.period_date DESC;

COMMENT ON VIEW v_exit_survey_metrics IS 'Exit survey metrics by period - replaces getExitSurveyData()';

-- ============================================
-- VIEW: Top Exit Reasons
-- ============================================

CREATE OR REPLACE VIEW v_top_exit_reasons AS
SELECT
    t.period_date,
    tr.reason_label,
    tr.reason_category,
    COUNT(*) AS count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY t.period_date), 1) AS percentage,
    RANK() OVER (PARTITION BY t.period_date ORDER BY COUNT(*) DESC) AS rank
FROM fact_terminations t
JOIN dim_term_reasons tr ON tr.reason_id = t.reason_id
GROUP BY t.period_date, tr.reason_label, tr.reason_category
ORDER BY t.period_date DESC, count DESC;

COMMENT ON VIEW v_top_exit_reasons IS 'Top termination reasons by period with percentages';

-- ============================================
-- VIEW: School Turnover
-- ============================================

CREATE OR REPLACE VIEW v_school_turnover AS
SELECT
    t.period_date,
    s.school_id,
    s.code AS school_code,
    s.name AS school_name,

    COUNT(t.termination_id) AS departures,
    COUNT(CASE WHEN t.termination_type = 'voluntary' THEN 1 END) AS voluntary,
    COUNT(CASE WHEN t.termination_type = 'involuntary' THEN 1 END) AS involuntary,
    COUNT(CASE WHEN t.termination_type = 'retirement' THEN 1 END) AS retirement,

    RANK() OVER (PARTITION BY t.period_date ORDER BY COUNT(*) DESC) AS turnover_rank

FROM fact_terminations t
JOIN dim_schools s ON s.school_id = t.school_id
GROUP BY t.period_date, s.school_id, s.code, s.name
ORDER BY t.period_date DESC, departures DESC;

COMMENT ON VIEW v_school_turnover IS 'Turnover by school with ranking';

-- ============================================
-- VIEW: Internal Mobility Summary
-- ============================================

CREATE OR REPLACE VIEW v_mobility_summary AS
SELECT
    fp.period_date,
    fp.fiscal_year,
    fp.fiscal_quarter,
    fp.quarter_label,

    COUNT(m.event_id) AS total_events,

    -- By type
    COUNT(CASE WHEN m.action_type = 'promotion' THEN 1 END) AS promotions,
    COUNT(CASE WHEN m.action_type = 'transfer' THEN 1 END) AS transfers,
    COUNT(CASE WHEN m.action_type = 'demotion' THEN 1 END) AS demotions,
    COUNT(CASE WHEN m.action_type = 'reclassification' THEN 1 END) AS reclassifications,
    COUNT(CASE WHEN m.action_type = 'lateral' THEN 1 END) AS lateral_moves,

    -- Cross-org movement
    COUNT(CASE WHEN m.is_cross_school = true THEN 1 END) AS cross_school_moves,
    COUNT(CASE WHEN m.is_cross_department = true THEN 1 END) AS cross_department_moves

FROM dim_fiscal_periods fp
LEFT JOIN fact_mobility_events m ON m.period_date = fp.period_date
WHERE fp.is_quarter_end = true
GROUP BY fp.period_date, fp.fiscal_year, fp.fiscal_quarter, fp.quarter_label
ORDER BY fp.period_date DESC;

COMMENT ON VIEW v_mobility_summary IS 'Internal mobility metrics by period';
