-- Seed: Employee State Residence Data
-- Benefit-eligible employee counts by state of residence
-- Same counts apply to Q4 FY25, Q1 FY26, and Q2 FY26
-- Total: 2,749 benefit-eligible employees across 20 states

-- Q4 FY25 (2025-06-30)
INSERT INTO fact_employee_state_residence (period_date, state_code, employee_count, source_file) VALUES
('2025-06-30', 'NE', 2218, 'manual_seed_fy25_q4'),
('2025-06-30', 'AZ', 487, 'manual_seed_fy25_q4'),
('2025-06-30', 'IA', 9, 'manual_seed_fy25_q4'),
('2025-06-30', 'MN', 5, 'manual_seed_fy25_q4'),
('2025-06-30', 'CO', 4, 'manual_seed_fy25_q4'),
('2025-06-30', 'FL', 4, 'manual_seed_fy25_q4'),
('2025-06-30', 'OH', 4, 'manual_seed_fy25_q4'),
('2025-06-30', 'IL', 3, 'manual_seed_fy25_q4'),
('2025-06-30', 'CA', 2, 'manual_seed_fy25_q4'),
('2025-06-30', 'KS', 2, 'manual_seed_fy25_q4'),
('2025-06-30', 'OR', 2, 'manual_seed_fy25_q4'),
('2025-06-30', 'CT', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'GA', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'MD', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'MO', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'NJ', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'NV', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'PA', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'UT', 1, 'manual_seed_fy25_q4'),
('2025-06-30', 'VA', 1, 'manual_seed_fy25_q4'),

-- Q1 FY26 (2025-09-30)
('2025-09-30', 'NE', 2218, 'manual_seed_fy26_q1'),
('2025-09-30', 'AZ', 487, 'manual_seed_fy26_q1'),
('2025-09-30', 'IA', 9, 'manual_seed_fy26_q1'),
('2025-09-30', 'MN', 5, 'manual_seed_fy26_q1'),
('2025-09-30', 'CO', 4, 'manual_seed_fy26_q1'),
('2025-09-30', 'FL', 4, 'manual_seed_fy26_q1'),
('2025-09-30', 'OH', 4, 'manual_seed_fy26_q1'),
('2025-09-30', 'IL', 3, 'manual_seed_fy26_q1'),
('2025-09-30', 'CA', 2, 'manual_seed_fy26_q1'),
('2025-09-30', 'KS', 2, 'manual_seed_fy26_q1'),
('2025-09-30', 'OR', 2, 'manual_seed_fy26_q1'),
('2025-09-30', 'CT', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'GA', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'MD', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'MO', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'NJ', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'NV', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'PA', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'UT', 1, 'manual_seed_fy26_q1'),
('2025-09-30', 'VA', 1, 'manual_seed_fy26_q1'),

-- Q2 FY26 (2025-12-31)
('2025-12-31', 'NE', 2218, 'manual_seed_fy26_q2'),
('2025-12-31', 'AZ', 487, 'manual_seed_fy26_q2'),
('2025-12-31', 'IA', 9, 'manual_seed_fy26_q2'),
('2025-12-31', 'MN', 5, 'manual_seed_fy26_q2'),
('2025-12-31', 'CO', 4, 'manual_seed_fy26_q2'),
('2025-12-31', 'FL', 4, 'manual_seed_fy26_q2'),
('2025-12-31', 'OH', 4, 'manual_seed_fy26_q2'),
('2025-12-31', 'IL', 3, 'manual_seed_fy26_q2'),
('2025-12-31', 'CA', 2, 'manual_seed_fy26_q2'),
('2025-12-31', 'KS', 2, 'manual_seed_fy26_q2'),
('2025-12-31', 'OR', 2, 'manual_seed_fy26_q2'),
('2025-12-31', 'CT', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'GA', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'MD', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'MO', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'NJ', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'NV', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'PA', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'UT', 1, 'manual_seed_fy26_q2'),
('2025-12-31', 'VA', 1, 'manual_seed_fy26_q2')

ON CONFLICT (period_date, state_code) DO UPDATE SET
    employee_count = EXCLUDED.employee_count,
    source_file = EXCLUDED.source_file,
    loaded_at = NOW();
