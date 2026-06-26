const db = require("./config/database");

console.log("Creating missing tables...");

// Create pricing table
db.run(`CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_type TEXT NOT NULL,
    price_per_unit REAL NOT NULL,
    size TEXT DEFAULT "standard",
    description TEXT,
    is_current INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, function(err) {
    if (err) console.error("Error creating pricing:", err.message);
    else console.log("✅ Pricing table ready");
});

// Create security_logs table
db.run(`CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, function(err) {
    if (err) console.error("Error creating security_logs:", err.message);
    else console.log("✅ Security_logs table ready");
});

// Create equipment table
db.run(`CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    condition TEXT DEFAULT "Good",
    maintenance_schedule TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`, function(err) {
    if (err) console.error("Error creating equipment:", err.message);
    else console.log("✅ Equipment table ready");
});

setTimeout(() => {
    console.log("✅ All tables created! Restart your server.");
    process.exit(0);
}, 1000);
