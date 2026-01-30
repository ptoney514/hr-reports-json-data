-- Seed: Assignment Categories
-- Based on Oracle HCM assignment category codes used at Creighton

INSERT INTO dim_assignment_categories (category_code, description, is_benefit_eligible, category_type) VALUES
-- Faculty categories (benefit-eligible)
('F12', 'Faculty 12-Month', true, 'faculty'),
('F11', 'Faculty 11-Month', true, 'faculty'),
('F10', 'Faculty 10-Month', true, 'faculty'),
('F09', 'Faculty 9-Month', true, 'faculty'),

-- Part-time staff (benefit-eligible based on hours)
('PT12', 'Part-Time 12-Month', true, 'staff'),
('PT11', 'Part-Time 11-Month', true, 'staff'),
('PT10', 'Part-Time 10-Month', true, 'staff'),
('PT9', 'Part-Time 9-Month', true, 'staff'),

-- Student workers (not benefit-eligible)
('SUE', 'Student Worker', false, 'student'),
('CWS', 'College Work Study', false, 'student'),

-- House Staff Physicians (special category)
('HSR', 'House Staff Resident', false, 'hsp'),
('HSP', 'House Staff Physician', false, 'hsp'),

-- Temporary/Non-benefit eligible
('TEMP', 'Temporary Employee', false, 'temp'),
('NBE', 'Non-Benefit Eligible', false, 'temp'),
('PRN', 'Per Diem (As Needed)', false, 'temp'),

-- Other
('JESUIT', 'Jesuit Community', false, 'other')

ON CONFLICT (category_code) DO UPDATE SET
    description = EXCLUDED.description,
    is_benefit_eligible = EXCLUDED.is_benefit_eligible,
    category_type = EXCLUDED.category_type,
    updated_at = NOW();
