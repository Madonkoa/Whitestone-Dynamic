// config/database.js - SQLite database connection and table creation
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path (creates database.db in the backend folder)
const dbPath = path.join(__dirname, '..', 'database.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        console.log('📁 Database file:', dbPath);
    }
});

// ============================================
// CREATE ALL TABLES
// ============================================

function createTables() {
    console.log('📊 Creating database tables...');

    // EMPLOYEES
    db.run(`
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            dob TEXT,
            address TEXT,
            position TEXT,
            role TEXT DEFAULT 'farmer',
            access_rights TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // CUSTOMERS
    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT,
            type TEXT DEFAULT 'regular',
            total_purchases REAL DEFAULT 0,
            last_purchase DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // STOCK
    db.run(`
        CREATE TABLE IF NOT EXISTS stock (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_type TEXT NOT NULL,
            quantity INTEGER DEFAULT 0,
            unit TEXT,
            price REAL DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // FEED
    db.run(`
        CREATE TABLE IF NOT EXISTS feed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feed_type TEXT NOT NULL,
            quantity_kg REAL DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // COOPS
    db.run(`
        CREATE TABLE IF NOT EXISTS coops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            coop_number INTEGER NOT NULL,
            zone_letter TEXT NOT NULL,
            current_stock INTEGER DEFAULT 0,
            health_status TEXT DEFAULT 'Good',
            last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT
        )
    `);

    // BATCHES
    db.run(`
        CREATE TABLE IF NOT EXISTS batches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            batch_number TEXT UNIQUE NOT NULL,
            type TEXT NOT NULL,
            quantity INTEGER DEFAULT 0,
            age INTEGER DEFAULT 0,
            status TEXT DEFAULT 'Active',
            start_date DATETIME,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // EGG PRODUCTION
    db.run(`
        CREATE TABLE IF NOT EXISTS egg_production (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL,
            batch_id INTEGER,
            small_eggs INTEGER DEFAULT 0,
            medium_eggs INTEGER DEFAULT 0,
            large_eggs INTEGER DEFAULT 0,
            xl_eggs INTEGER DEFAULT 0,
            total INTEGER DEFAULT 0,
            notes TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (batch_id) REFERENCES batches(id)
        )
    `);

    // EGG SALES
    db.run(`
        CREATE TABLE IF NOT EXISTS egg_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer_name TEXT NOT NULL,
            sale_date DATETIME NOT NULL,
            egg_size TEXT,
            crates INTEGER DEFAULT 0,
            pieces INTEGER DEFAULT 0,
            price_per_crate REAL DEFAULT 0,
            total_eggs INTEGER DEFAULT 0,
            total REAL DEFAULT 0,
            notes TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // CHICKEN SALES
    db.run(`
        CREATE TABLE IF NOT EXISTS chicken_sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            buyer TEXT NOT NULL,
            sale_date DATETIME NOT NULL,
            chicken_type TEXT NOT NULL,
            quantity INTEGER DEFAULT 0,
            price REAL DEFAULT 0,
            status TEXT DEFAULT 'undressed',
            total REAL DEFAULT 0,
            notes TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // CHICKENS
    db.run(`
        CREATE TABLE IF NOT EXISTS chickens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            batch TEXT,
            quantity INTEGER DEFAULT 0,
            age INTEGER DEFAULT 0,
            health TEXT DEFAULT 'Good',
            ready_for_sale INTEGER DEFAULT 0,
            egg_production INTEGER DEFAULT 0,
            sold INTEGER DEFAULT 0,
            added_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // EQUIPMENT
    db.run(`
        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            condition TEXT DEFAULT 'Good',
            purchase_date DATETIME,
            last_maintenance DATETIME,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // SECURITY
    db.run(`
        CREATE TABLE IF NOT EXISTS security (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_type TEXT NOT NULL,
            description TEXT,
            date_reported DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved INTEGER DEFAULT 0
        )
    `);

    // FEED CONSUMPTION
    db.run(`
        CREATE TABLE IF NOT EXISTS feed_consumption (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feed_type TEXT NOT NULL,
            date DATETIME NOT NULL,
            bags INTEGER DEFAULT 0,
            bag_size INTEGER DEFAULT 50,
            total_kg REAL DEFAULT 0,
            condition TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // FEED STOCK RECORDS
    db.run(`
        CREATE TABLE IF NOT EXISTS feed_stock_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feed_type TEXT NOT NULL,
            date DATETIME NOT NULL,
            bags INTEGER DEFAULT 0,
            bag_size INTEGER DEFAULT 50,
            total_kg REAL DEFAULT 0,
            total_cost REAL DEFAULT 0,
            supplier TEXT,
            recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // PRICING (Current)
    db.run(`
        CREATE TABLE IF NOT EXISTS pricing (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            egg_tray REAL DEFAULT 120.00,
            egg_piece REAL DEFAULT 2.00,
            dressed_chicken REAL DEFAULT 90.00,
            undressed_chicken REAL DEFAULT 85.00,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // PRICING HISTORY
    db.run(`
        CREATE TABLE IF NOT EXISTS pricing_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            egg_tray REAL DEFAULT 0,
            egg_piece REAL DEFAULT 0,
            dressed_chicken REAL DEFAULT 0,
            undressed_chicken REAL DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ All database tables created/verified!');
}

// Initialize database with tables
createTables();

// ============================================
// INSERT DEFAULT DATA
// ============================================

function insertDefaultData() {
    console.log('📊 Inserting default data...');

    // Check if employees exist
    db.get('SELECT COUNT(*) as count FROM employees', (err, row) => {
        if (err) {
            console.error('❌ Error checking employees:', err.message);
            return;
        }
        if (row.count === 0) {
            db.run(`
                INSERT INTO employees (username, password_hash, name, surname, position, role, access_rights)
                VALUES ('admin', '', 'Nomagugu', 'Admin', 'Owner', 'owner', 'admin,manager,owner')
            `, (err) => {
                if (err) console.error('❌ Error inserting admin:', err.message);
                else console.log('✅ Default admin user created');
            });
        }
    });

    // Check if pricing exists
    db.get('SELECT COUNT(*) as count FROM pricing', (err, row) => {
        if (err) {
            console.error('❌ Error checking pricing:', err.message);
            return;
        }
        if (row.count === 0) {
            db.run(`
                INSERT INTO pricing (egg_tray, egg_piece, dressed_chicken, undressed_chicken)
                VALUES (120.00, 2.00, 90.00, 85.00)
            `, (err) => {
                if (err) console.error('❌ Error inserting pricing:', err.message);
                else console.log('✅ Default pricing created');
            });
        }
    });

    // Check if stock exists
    db.get('SELECT COUNT(*) as count FROM stock', (err, row) => {
        if (err) {
            console.error('❌ Error checking stock:', err.message);
            return;
        }
        if (row.count === 0) {
            db.run(`
                INSERT INTO stock (item_type, quantity, unit, price)
                VALUES 
                    ('broiler', 320, 'bird', 85.00),
                    ('layer', 240, 'bird', 0),
                    ('egg', 540, 'tray', 120.00)
            `, (err) => {
                if (err) console.error('❌ Error inserting stock:', err.message);
                else console.log('✅ Default stock created');
            });
        }
    });

    // Check if feed exists
    db.get('SELECT COUNT(*) as count FROM feed', (err, row) => {
        if (err) {
            console.error('❌ Error checking feed:', err.message);
            return;
        }
        if (row.count === 0) {
            db.run(`
                INSERT INTO feed (feed_type, quantity_kg)
                VALUES 
                    ('Layer Feed Premium', 1850),
                    ('Layer Feed Standard', 1200),
                    ('Broiler Starter', 900),
                    ('Broiler Finisher', 700)
            `, (err) => {
                if (err) console.error('❌ Error inserting feed:', err.message);
                else console.log('✅ Default feed created');
            });
        }
    });

    // Check if coops exist
    db.get('SELECT COUNT(*) as count FROM coops', (err, row) => {
        if (err) {
            console.error('❌ Error checking coops:', err.message);
            return;
        }
        if (row.count === 0) {
            const coops = [
                { coop: 1, zone: 'A', stock: 45, health: 'Good', notes: 'Full capacity - healthy flock' },
                { coop: 1, zone: 'B', stock: 38, health: 'Excellent', notes: 'Growing well - excellent condition' },
                { coop: 1, zone: 'C', stock: 42, health: 'Good', notes: 'Routine check complete' },
                { coop: 2, zone: 'A', stock: 35, health: 'Good', notes: 'Good production - healthy' },
                { coop: 2, zone: 'B', stock: 40, health: 'Fair', notes: 'Need more space - fair condition' },
                { coop: 2, zone: 'C', stock: 30, health: 'Good', notes: 'Health check due' },
                { coop: 3, zone: 'A', stock: 25, health: 'Fair', notes: 'Young flock - developing well' },
                { coop: 3, zone: 'B', stock: 20, health: 'Good', notes: 'Excellent condition' },
                { coop: 3, zone: 'C', stock: 18, health: 'Excellent', notes: 'Ready for sale' }
            ];
            coops.forEach(c => {
                db.run(`
                    INSERT INTO coops (coop_number, zone_letter, current_stock, health_status, notes)
                    VALUES (?, ?, ?, ?, ?)
                `, [c.coop, c.zone, c.stock, c.health, c.notes]);
            });
            console.log('✅ Default coops created (9 zones)');
        }
    });
}

// Run after tables are created
setTimeout(() => {
    insertDefaultData();
    console.log('✅ Database initialization complete!');
}, 500);

module.exports = db;