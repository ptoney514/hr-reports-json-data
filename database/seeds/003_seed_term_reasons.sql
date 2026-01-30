-- Seed: Termination Reasons
-- Normalized from 16+ Oracle HCM termination reason variants

INSERT INTO dim_term_reasons (reason_code, reason_label, reason_category, is_voluntary, display_order) VALUES
-- Voluntary reasons
('RESIGN', 'Resignation', 'voluntary', true, 1),
('RESIGN_CAREER', 'Resignation - Career Change', 'voluntary', true, 2),
('RESIGN_RELOCATION', 'Resignation - Relocation', 'voluntary', true, 3),
('RESIGN_PERSONAL', 'Resignation - Personal Reasons', 'voluntary', true, 4),
('RESIGN_OPPORTUNITY', 'Resignation - Better Opportunity', 'voluntary', true, 5),
('RESIGN_COMPENSATION', 'Resignation - Compensation', 'voluntary', true, 6),
('RESIGN_HEALTH', 'Resignation - Health/Medical', 'voluntary', true, 7),
('END_ASSIGNMENT', 'End of Assignment', 'voluntary', true, 8),
('END_TEMP', 'End of Temporary Assignment', 'voluntary', true, 9),
('GRAD_STUDENT', 'Student Graduation/Completion', 'voluntary', true, 10),

-- Retirement
('RETIRE', 'Retirement', 'retirement', true, 20),
('RETIRE_EARLY', 'Early Retirement', 'retirement', true, 21),
('RETIRE_DISABILITY', 'Disability Retirement', 'retirement', true, 22),

-- Involuntary reasons
('TERM_PERFORMANCE', 'Termination - Performance', 'involuntary', false, 30),
('TERM_POLICY', 'Termination - Policy Violation', 'involuntary', false, 31),
('TERM_CONDUCT', 'Termination - Conduct', 'involuntary', false, 32),
('LAYOFF', 'Layoff/Reduction in Force', 'involuntary', false, 33),
('POSITION_ELIM', 'Position Elimination', 'involuntary', false, 34),
('TERM_PROBATION', 'Termination - Probationary Period', 'involuntary', false, 35),

-- Other
('DEATH', 'Death', 'other', false, 40),
('TRANSFER_OUT', 'Transfer to Affiliate', 'other', false, 41),
('OTHER', 'Other', 'other', false, 99)

ON CONFLICT (reason_code) DO UPDATE SET
    reason_label = EXCLUDED.reason_label,
    reason_category = EXCLUDED.reason_category,
    is_voluntary = EXCLUDED.is_voluntary,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();
