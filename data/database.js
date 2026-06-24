// database.js - Database schema for future SQLite integration
// Currently using localStorage for data persistence

console.log('Database module ready for future SQLite integration');

/*
Future SQLite Schema:

CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    dob TEXT,
    address TEXT,
    position TEXT,
    access_rights TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    unit TEXT,
    price REAL,
    last_updated TEXT
);

CREATE TABLE feed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feed_type TEXT NOT NULL,
    quantity_kg REAL DEFAULT 0,
    last_updated TEXT
);

CREATE TABLE coops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coop_number INTEGER NOT NULL,
    zone_letter TEXT NOT NULL,
    current_stock INTEGER DEFAULT 0,
    health_status TEXT DEFAULT 'Good',
    last_checked TEXT,
    notes TEXT
);

CREATE TABLE eggs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    batch_id INTEGER,
    small_eggs INTEGER DEFAULT 0,
    medium_eggs INTEGER DEFAULT 0,
    large_eggs INTEGER DEFAULT 0,
    xl_eggs INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    notes TEXT,
    recorded_at TEXT
);

CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_name TEXT NOT NULL,
    sale_date TEXT NOT NULL,
    egg_size TEXT,
    crates INTEGER DEFAULT 0,
    pieces INTEGER DEFAULT 0,
    price_per_crate REAL,
    total_eggs INTEGER DEFAULT 0,
    total REAL DEFAULT 0,
    notes TEXT,
    recorded_at TEXT
);

CREATE TABLE security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_type TEXT,
    description TEXT,
    date_reported TEXT,
    resolved INTEGER DEFAULT 0
);

CREATE TABLE equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    condition TEXT,
    purchase_date TEXT,
    last_maintenance TEXT,
    notes TEXT
);
*/