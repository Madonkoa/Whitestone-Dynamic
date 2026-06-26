const db = require('./config/database');

console.log('Adding stock_movements table...');

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

// Add triggers for automatic movement logging
db.run(CREATE TRIGGER IF NOT EXISTS stock_purchase_trigger
    AFTER INSERT ON stock
    BEGIN
        INSERT INTO stock_movements (stock_item_id, movement_type, quantity, notes)
        VALUES (NEW.id, 'purchase', NEW.quantity, 'Initial stock addition');
    END
, function(err) {
    if (err) console.error('Error creating purchase trigger:', err.message);
    else console.log('✅ Purchase trigger created');
});

console.log('✅ Stock movements system ready!');
setTimeout(() => process.exit(0), 1000);
