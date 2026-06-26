-- Add sample stock movements
INSERT OR IGNORE INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) 
SELECT 1, 'purchase', 500, NULL, NULL, 'Initial stock purchase' 
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE movement_type = 'purchase' AND stock_item_id = 1 LIMIT 1);

INSERT OR IGNORE INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) 
SELECT 2, 'consumption', 200, NULL, NULL, 'Used for Batch B-2026-0001' 
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE movement_type = 'consumption' AND stock_item_id = 2 LIMIT 1);

INSERT OR IGNORE INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) 
SELECT 3, 'transfer', 50, 'Coop 1', 'Coop 2', 'Coop 1 to Coop 2' 
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE movement_type = 'transfer' AND stock_item_id = 3 LIMIT 1);

INSERT OR IGNORE INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) 
SELECT 4, 'sale', 240, NULL, NULL, 'Sold to Mary Molefe' 
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE movement_type = 'sale' AND stock_item_id = 4 LIMIT 1);

INSERT OR IGNORE INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) 
SELECT 5, 'adjustment', 10, NULL, NULL, 'Stock count correction' 
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE movement_type = 'adjustment' AND stock_item_id = 5 LIMIT 1);

INSERT OR IGNORE INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) 
SELECT 6, 'waste', 25, NULL, NULL, 'Damaged feed discarded' 
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE movement_type = 'waste' AND stock_item_id = 6 LIMIT 1);
