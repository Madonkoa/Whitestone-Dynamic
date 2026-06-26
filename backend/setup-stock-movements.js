const db = require('./config/database');

console.log('Setting up stock movements...');

// Create the stock_movements table
db.run(CREATE TABLE IF NOT EXISTS stock_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_item_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL,
    quantity REAL NOT NULL,
    from_location TEXT,
    to_location TEXT,
    related_batch_id INTEGER,
    user_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_item_id) REFERENCES stock(id) ON DELETE CASCADE,
    FOREIGN KEY (related_batch_id) REFERENCES batches(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES employees(id) ON DELETE SET NULL
), function(err) {
    if (err) {
        console.error('Error creating stock_movements:', err.message);
    } else {
        console.log('✅ stock_movements table created');
    }
});

// Add sample movements if the table is empty
db.get('SELECT COUNT(*) as count FROM stock_movements', (err, row) => {
    if (err) {
        console.error('Error checking movements:', err.message);
        return;
    }
    if (row.count > 0) {
        console.log('✅ Movements already exist, skipping sample data');
        setTimeout(() => process.exit(0), 1000);
        return;
    }
    
    // Get stock items
    db.all('SELECT id, item_type FROM stock LIMIT 5', (err, stockItems) => {
        if (err || stockItems.length === 0) {
            console.log('⚠️ No stock items found. Please add stock items first.');
            setTimeout(() => process.exit(0), 1000);
            return;
        }
        
        console.log('Adding sample movements...');
        const movements = [
            { type: 'purchase', qty: 500, note: 'Initial stock purchase' },
            { type: 'consumption', qty: 200, note: 'Used for feeding Batch B-2026-0001' },
            { type: 'transfer', qty: 50, note: 'Coop 1 → Coop 2' },
            { type: 'sale', qty: 240, note: 'Sold to Mary Molefe' },
            { type: 'adjustment', qty: 10, note: 'Stock count adjustment' }
        ];
        
        let added = 0;
        movements.forEach((m, index) => {
            const itemId = stockItems[index % stockItems.length].id;
            db.run(
                'INSERT INTO stock_movements (stock_item_id, movement_type, quantity, notes) VALUES (?, ?, ?, ?)',
                [itemId, m.type, m.qty, m.note],
                function(err) {
                    if (err) {
                        console.error('Error adding movement:', err.message);
                    } else {
                        added++;
                        console.log('✅ Added: ' + m.type + ' ' + m.qty + ' units');
                    }
                    if (added === movements.length) {
                        console.log('✅ Sample movements added!');
                        setTimeout(() => process.exit(0), 1000);
                    }
                }
            );
        });
    });
});
