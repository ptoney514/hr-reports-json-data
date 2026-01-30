-- Seed: Schools and Organizations
-- Based on VP areas and schools used in HR reporting

INSERT INTO dim_schools (code, name, short_name, location, is_academic, sort_order) VALUES
-- Academic Schools
('CCAS', 'College of Arts & Sciences', 'Arts & Sciences', 'omaha', true, 1),
('SOM', 'School of Medicine', 'Medicine', 'omaha', true, 2),
('SPAHP', 'School of Pharmacy & Health Professions', 'Pharmacy & Health Prof', 'omaha', true, 3),
('DENT', 'School of Dentistry', 'Dentistry', 'omaha', true, 4),
('HCOB', 'Heider College of Business', 'Business', 'omaha', true, 5),
('LAW', 'School of Law', 'Law', 'omaha', true, 6),
('NURS', 'College of Nursing', 'Nursing', 'omaha', true, 7),
('GRAD', 'Graduate School', 'Graduate', 'omaha', true, 8),
('CPCE', 'College of Professional & Continuing Education', 'Prof & Cont Ed', 'omaha', true, 9),

-- Phoenix Campus
('PHXMED', 'Phoenix School of Medicine', 'Phoenix Medicine', 'phoenix', true, 10),
('PHXALL', 'Phoenix Alliance', 'Phoenix Alliance', 'phoenix', false, 11),

-- VP Areas (Administrative)
('PROVOST', 'Office of the Provost', 'Provost', 'omaha', false, 20),
('VPAA', 'VP Academic Affairs', 'Academic Affairs', 'omaha', false, 21),
('VPEM', 'VP Enrollment Management', 'Enrollment Mgmt', 'omaha', false, 22),
('VPFN', 'VP Finance', 'Finance', 'omaha', false, 23),
('VPLS', 'VP Legal Services', 'Legal', 'omaha', false, 24),
('VPMM', 'VP Mission & Ministry', 'Mission & Ministry', 'omaha', false, 25),
('VPGE', 'VP Global Engagement', 'Global Engagement', 'omaha', false, 26),
('VPRES', 'VP Research & Compliance', 'Research', 'omaha', false, 27),

-- Operations
('STUDLIFE', 'Student Life', 'Student Life', 'omaha', false, 30),
('STUDSUCC', 'Student Success', 'Student Success', 'omaha', false, 31),
('ATHLETICS', 'Athletics', 'Athletics', 'omaha', false, 32),
('FACILITIES', 'Facilities Management', 'Facilities', 'omaha', false, 33),
('IT', 'Information Technology', 'IT', 'omaha', false, 34),
('HR', 'Human Resources', 'HR', 'omaha', false, 35),
('UNREL', 'University Relations', 'University Relations', 'omaha', false, 36),
('COMM', 'Communications', 'Communications', 'omaha', false, 37),
('SAFETY', 'Public Safety', 'Public Safety', 'omaha', false, 38),
('CFE', 'Center for Faculty Excellence', 'Faculty Excellence', 'omaha', false, 39),
('DEI', 'Diversity, Equity & Inclusion', 'DEI', 'omaha', false, 40),
('LEGAL', 'General Counsel', 'General Counsel', 'omaha', false, 41),
('EVP', 'Executive Vice President', 'EVP', 'omaha', false, 42),
('PRES', 'Office of the President', 'President', 'omaha', false, 43),
('JESUIT', 'Jesuit Community', 'Jesuit Community', 'omaha', false, 50),
('CLINICAL', 'Clinical Affairs', 'Clinical Affairs', 'omaha', false, 51)

ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    short_name = EXCLUDED.short_name,
    location = EXCLUDED.location,
    is_academic = EXCLUDED.is_academic,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();
