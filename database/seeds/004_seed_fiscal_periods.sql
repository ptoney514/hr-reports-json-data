-- Seed: Fiscal Periods
-- Creighton fiscal year: July 1 - June 30
-- Pre-populate FY24 through FY27 quarter-end dates

-- FY24 (July 1, 2023 - June 30, 2024)
INSERT INTO dim_fiscal_periods (period_date, fiscal_year, fiscal_quarter, quarter_start, quarter_end, quarter_label, is_quarter_end, is_year_end) VALUES
('2023-09-30', 2024, 1, '2023-07-01', '2023-09-30', 'FY24_Q1', true, false),
('2023-12-31', 2024, 2, '2023-10-01', '2023-12-31', 'FY24_Q2', true, false),
('2024-03-31', 2024, 3, '2024-01-01', '2024-03-31', 'FY24_Q3', true, false),
('2024-06-30', 2024, 4, '2024-04-01', '2024-06-30', 'FY24_Q4', true, true),

-- FY25 (July 1, 2024 - June 30, 2025)
('2024-09-30', 2025, 1, '2024-07-01', '2024-09-30', 'FY25_Q1', true, false),
('2024-12-31', 2025, 2, '2024-10-01', '2024-12-31', 'FY25_Q2', true, false),
('2025-03-31', 2025, 3, '2025-01-01', '2025-03-31', 'FY25_Q3', true, false),
('2025-06-30', 2025, 4, '2025-04-01', '2025-06-30', 'FY25_Q4', true, true),

-- FY26 (July 1, 2025 - June 30, 2026)
('2025-09-30', 2026, 1, '2025-07-01', '2025-09-30', 'FY26_Q1', true, false),
('2025-12-31', 2026, 2, '2025-10-01', '2025-12-31', 'FY26_Q2', true, false),
('2026-03-31', 2026, 3, '2026-01-01', '2026-03-31', 'FY26_Q3', true, false),
('2026-06-30', 2026, 4, '2026-04-01', '2026-06-30', 'FY26_Q4', true, true),

-- FY27 (July 1, 2026 - June 30, 2027)
('2026-09-30', 2027, 1, '2026-07-01', '2026-09-30', 'FY27_Q1', true, false),
('2026-12-31', 2027, 2, '2026-10-01', '2026-12-31', 'FY27_Q2', true, false),
('2027-03-31', 2027, 3, '2027-01-01', '2027-03-31', 'FY27_Q3', true, false),
('2027-06-30', 2027, 4, '2027-04-01', '2027-06-30', 'FY27_Q4', true, true)

ON CONFLICT (period_date) DO UPDATE SET
    fiscal_year = EXCLUDED.fiscal_year,
    fiscal_quarter = EXCLUDED.fiscal_quarter,
    quarter_start = EXCLUDED.quarter_start,
    quarter_end = EXCLUDED.quarter_end,
    quarter_label = EXCLUDED.quarter_label,
    is_quarter_end = EXCLUDED.is_quarter_end,
    is_year_end = EXCLUDED.is_year_end;
