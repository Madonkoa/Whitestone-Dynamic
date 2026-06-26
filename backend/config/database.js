// config/database.js - SQLite database connection
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('âŒ Error connecting to database:', err.message);
    } else {
        console.log('âœ… Connected to SQLite database');
    }
});

// Create all tables
function createTables() {
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

    db.run(`
        CREATE TABLE IF NOT EXISTS feed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feed_type TEXT NOT NULL,
            quantity_kg REAL DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

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

    db.run(`
        CREATE TABLE IF NOT EXISTS security (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_type TEXT NOT NULL,
            description TEXT,
            date_reported DATETIME DEFAULT CURRENT_TIMESTAMP,
            resolved INTEGER DEFAULT 0
        )
    `);

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

    console.log('âœ… Database tables created/verified');
}

createTables();

// Insert default admin user
db.get('SELECT * FROM employees WHERE username = ?', ['admin'], (err, row) => {
    if (err) {
        console.error('Error checking admin:', err.message);
        return;
    }
    if (!row) {
        db.run(`
            INSERT INTO employees (username, password_hash, name, surname, position, role, access_rights)
            VALUES ('admin', '', 'Nomagugu', 'Admin', 'Owner', 'owner', 'admin,manager,owner')
        `, (err) => {
            if (err) console.error('Error creating admin:', err.message);
            else console.log('âœ… Default admin user created');
        });
    }
});

module.exports = db;
