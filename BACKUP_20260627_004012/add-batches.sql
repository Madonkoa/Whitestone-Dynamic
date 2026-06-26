-- Add more batch examples with different statuses
INSERT OR IGNORE INTO batches (batch_number, type, quantity, age, status, start_date, notes) VALUES
('B-2026-0005', 'Layer', 450, 32, 'Active', '2025-11-15', 'Peak production, excellent health'),
('B-2026-0006', 'Broiler', 300, 6, 'Growing', '2026-05-10', 'Growing well, good feed conversion'),
('B-2026-0007', 'Layer', 350, 55, 'Completed', '2025-07-01', 'Completed cycle, good production'),
('B-2026-0008', 'Broiler', 280, 8, 'Sold', '2026-04-01', 'Sold to commercial buyer'),
('B-2026-0009', 'Layer', 200, 12, 'Growing', '2026-04-20', 'Pullets growing into layers'),
('B-2026-0010', 'Broiler', 500, 4, 'Growing', '2026-05-25', 'Day-old chicks, healthy'),
('B-2026-0011', 'Layer', 400, 45, 'Culled', '2026-02-01', 'Production dropped below threshold'),
('B-2026-0012', 'Layer', 250, 60, 'Completed', '2025-08-15', 'Excellent production history'),
('B-2026-0013', 'Broiler', 350, 5, 'Growing', '2026-05-15', 'Vaccinated, good growth'),
('B-2026-0014', 'Layer', 300, 15, 'Active', '2026-03-15', 'Entering peak production');
