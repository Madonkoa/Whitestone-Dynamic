const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'backend', 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add new columns to employees table
    const columns = [
        'date_of_birth DATE',
        'id_number VARCHAR(20)',
        'gender VARCHAR(10)',
        'race VARCHAR(20)',
        'nationality VARCHAR(50)',
        'home_language VARCHAR(30)',
        'marital_status VARCHAR(20)',
        'dependents INTEGER DEFAULT 0',
        'phone_home VARCHAR(20)',
        'physical_address TEXT',
        'postal_address TEXT',
        'emergency_contact_name VARCHAR(100)',
        'emergency_contact_relationship VARCHAR(50)',
        'emergency_contact_phone VARCHAR(20)',
        'employee_number VARCHAR(20)',
        'department VARCHAR(50)',
        'job_title VARCHAR(100)',
        'employment_type VARCHAR(20)',
        'contract_start_date DATE',
        'contract_end_date DATE',
        'probation_days INTEGER DEFAULT 0',
        'probation_end_date DATE',
        'working_hours_per_week INTEGER DEFAULT 40',
        'shift_schedule VARCHAR(100)',
        'salary_amount DECIMAL(15,2)',
        'salary_type VARCHAR(20)',
        'bank_name VARCHAR(100)',
        'bank_account VARCHAR(20)',
        'bank_branch_code VARCHAR(10)',
        'tax_reference VARCHAR(20)',
        'uif_number VARCHAR(20)',
        'pension_fund_number VARCHAR(30)',
        'medical_aid_number VARCHAR(30)',
        'annual_leave_taken INTEGER DEFAULT 0',
        'annual_leave_remaining INTEGER DEFAULT 0',
        'sick_leave_taken INTEGER DEFAULT 0',
        'sick_leave_remaining INTEGER DEFAULT 0',
        'family_responsibility_leave_taken INTEGER DEFAULT 0',
        'family_responsibility_leave_remaining INTEGER DEFAULT 0',
        'maternity_leave_taken INTEGER DEFAULT 0',
        'maternity_leave_remaining INTEGER DEFAULT 0',
        'performance_rating INTEGER DEFAULT 0',
        'last_review_date DATE',
        'next_review_date DATE',
        'review_notes TEXT',
        'popia_consent_date DATE',
        'handbook_acknowledged BOOLEAN DEFAULT 0',
        'code_of_conduct_acknowledged BOOLEAN DEFAULT 0',
        'health_safety_agreement_signed BOOLEAN DEFAULT 0',
        'termination_date DATE',
        'termination_reason VARCHAR(50)',
        'notice_period_days INTEGER DEFAULT 0',
        'notice_given_date DATE',
        'final_pay_date DATE',
        'exit_interview_notes TEXT'
    ];

    columns.forEach(col => {
        const [name, type] = col.split(' ');
        db.run(`ALTER TABLE employees ADD COLUMN ${name} ${type}`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.log(`⚠️ ${err.message}`);
            } else if (!err) {
                console.log(`✅ Added column: ${name}`);
            }
        });
    });

    // Create employee_documents table
    db.run(`
        CREATE TABLE IF NOT EXISTS employee_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            document_type VARCHAR(50),
            document_name VARCHAR(255),
            file_path VARCHAR(500),
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            uploaded_by INTEGER,
            notes TEXT,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
    `, (err) => {
        if (err) console.log('⚠️ employee_documents:', err.message);
        else console.log('✅ employee_documents table created');
    });

    // Create employee_training table
    db.run(`
        CREATE TABLE IF NOT EXISTS employee_training (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            training_name VARCHAR(200),
            training_provider VARCHAR(200),
            training_date DATE,
            expiry_date DATE,
            certificate_path VARCHAR(500),
            notes TEXT,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
    `, (err) => {
        if (err) console.log('⚠️ employee_training:', err.message);
        else console.log('✅ employee_training table created');
    });

    // Create employee_performance_reviews table
    db.run(`
        CREATE TABLE IF NOT EXISTS employee_performance_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            review_date DATE,
            reviewer_id INTEGER,
            rating INTEGER,
            comments TEXT,
            goals TEXT,
            next_review_date DATE,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
    `, (err) => {
        if (err) console.log('⚠️ employee_performance_reviews:', err.message);
        else console.log('✅ employee_performance_reviews table created');
    });
});

db.close(() => {
    console.log('✅ Database migration complete!');
});
