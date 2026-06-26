const db = require('./config/database');

console.log('Adding sample stock movements...');

// Get stock items
db.all('SELECT id, item_type FROM stock LIMIT 5', (err, stockItems) => {
    if (err || stockItems.length === 0) {
        console.log('No stock items found.');
        process.exit(0);
        return;
    }

    // Check if movements already exist
    db.get('SELECT COUNT(*) as count FROM stock_movements', (err, row) => {
        if (err) {
            console.error('Error checking movements:', err.message);
            process.exit(0);
            return;
        }
        
        if (row.count > 0) {
            console.log('Movements already exist (' + row.count + ' records)');
            process.exit(0);
            return;
        }

        const movements = [
            { type: 'purchase', qty: 500, note: 'Initial stock purchase', from: null, to: null },
            { type: 'consumption', qty: 200, note: 'Used for Batch B-2026-0001', from: null, to: null },
            { type: 'transfer', qty: 50, note: 'Coop 1 to Coop 2', from: 'Coop 1', to: 'Coop 2' },
            { type: 'sale', qty: 240, note: 'Sold to Mary Molefe', from: null, to: null },
            { type: 'adjustment', qty: 10, note: 'Stock count correction', from: null, to: null },
            { type: 'waste', qty: 25, note: 'Damaged feed discarded', from: null, to: null }
        ];

        let added = 0;
        movements.forEach((m, index) => {
            const itemId = stockItems[index % stockItems.length].id;
            db.run(
                'INSERT INTO stock_movements (stock_item_id, movement_type, quantity, from_location, to_location, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [itemId, m.type, m.qty, m.from, m.to, m.note],
                function(err) {
                    if (err) {
                        console.error('Error adding movement:', err.message);
                    } else {
                        added++;
                        console.log('Added: ' + m.type + ' ' + m.qty + ' units');
                    }
                    if (added === movements.length) {
                        console.log('All sample movements added!');
                        process.exit(0);
                    }
                }
            );
        });
    });
});
