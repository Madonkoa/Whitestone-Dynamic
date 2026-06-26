const db = require('./config/database');

console.log('Creating Products and Variants tables...');

// Create products table
db.run(CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
), (err) => {
    if (err) console.error('Error creating products:', err.message);
    else console.log('✅ Products table ready');
});

// Create product_variants table
db.run(CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    variant_name TEXT NOT NULL,
    sku TEXT,
    supplier TEXT,
    unit TEXT NOT NULL,
    quantity REAL DEFAULT 0,
    price REAL DEFAULT 0,
    threshold REAL DEFAULT 10,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
), (err) => {
    if (err) console.error('Error creating product_variants:', err.message);
    else console.log('✅ Product variants table ready');
});

setTimeout(() => {
    console.log('✅ Database tables ready!');
    process.exit(0);
}, 1000);
