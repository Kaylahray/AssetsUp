-- Insert sample maintenance records
INSERT INTO maintenance (
    type, description, cost, start_date, due_date, status, 
    estimated_hours, asset_id, responsible_person_id, notes
) VALUES 
(
    'preventive',
    'Quarterly HVAC system inspection and filter replacement',
    250.00,
    '2024-01-15',
    '2024-01-20',
    'completed',
    4,
    (SELECT id FROM assets WHERE name LIKE '%HVAC%' LIMIT 1),
    (SELECT id FROM users WHERE department = 'Maintenance' LIMIT 1),
    'Replaced air filters, checked refrigerant levels, cleaned coils'
),
(
    'corrective',
    'Repair faulty conveyor belt motor',
    1200.00,
    '2024-02-01',
    '2024-02-05',
    'in_progress',
    8,
    (SELECT id FROM assets WHERE name LIKE '%Conveyor%' LIMIT 1),
    (SELECT id FROM users WHERE department = 'Engineering' LIMIT 1),
    'Motor showing signs of overheating, needs replacement'
),
(
    'inspection',
    'Annual safety inspection of lifting equipment',
    500.00,
    '2024-03-01',
    '2024-03-15',
    'scheduled',
    6,
    (SELECT id FROM assets WHERE name LIKE '%Crane%' OR name LIKE '%Lift%' LIMIT 1),
    (SELECT id FROM users WHERE role = 'Safety Inspector' LIMIT 1),
    'Required annual certification inspection'
),
(
    'preventive',
    'Monthly generator maintenance and testing',
    150.00,
    '2024-02-20',
    '2024-02-25',
    'overdue',
    2,
    (SELECT id FROM assets WHERE name LIKE '%Generator%' LIMIT 1),
    (SELECT id FROM users WHERE department = 'Facilities' LIMIT 1),
    'Check oil levels, test automatic start, inspect connections'
);

-- Insert upcoming maintenance for demonstration
INSERT INTO maintenance (
    type, description, cost, start_date, due_date, status, 
    estimated_hours, asset_id, responsible_person_id
) VALUES 
(
    'preventive',
    'Weekly equipment lubrication',
    75.00,
    CURRENT_DATE + INTERVAL '2 days',
    CURRENT_DATE + INTERVAL '5 days',
    'scheduled',
    2,
    (SELECT id FROM assets LIMIT 1),
    (SELECT id FROM users LIMIT 1)
),
(
    'inspection',
    'Fire safety system check',
    300.00,
    CURRENT_DATE + INTERVAL '1 week',
    CURRENT_DATE + INTERVAL '10 days',
    'scheduled',
    4,
    (SELECT id FROM assets WHERE name LIKE '%Fire%' OR name LIKE '%Safety%' LIMIT 1),
    (SELECT id FROM users WHERE role LIKE '%Safety%' LIMIT 1)
);
