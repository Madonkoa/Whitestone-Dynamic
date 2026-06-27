// routes/employees.js - Using employee_number as unique identifier
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

// Helper: Generate employee number
function generateEmployeeNumber(callback) {
    db.get('SELECT employee_number FROM employees ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) return callback(err);
        let nextNum = 1;
        if (row && row.employee_number) {
            const match = row.employee_number.match(/WS-EMP(\d+)/);
            if (match) {
                nextNum = parseInt(match[1]) + 1;
            }
        }
        const padded = String(nextNum).padStart(3, '0');
        callback(null, 'WS-EMP' + padded);
    });
}

// GET all employees
router.get('/', (req, res) => {
    db.all('SELECT * FROM employees ORDER BY id', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// GET employee by employee_number
router.get('/:employeeNumber', (req, res) => {
    const { employeeNumber } = req.params;
    db.get('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber], (err, employee) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    });
});

// POST create employee
router.post('/', async (req, res) => {
    try {
        const {
            username, password, name, surname, date_of_birth, id_number,
            gender, race, nationality, home_language, marital_status, dependents,
            email, phone, phone_home, physical_address, postal_address,
            emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
            department, job_title, role, employment_type,
            contract_start_date, contract_end_date, probation_days, probation_end_date,
            working_hours_per_week, shift_schedule, salary_amount, salary_type,
            bank_name, bank_account, bank_branch_code, tax_reference, uif_number,
            pension_fund_number, medical_aid_number, access_rights, is_active,
            annual_leave_taken, annual_leave_remaining, sick_leave_taken, sick_leave_remaining,
            family_responsibility_leave_taken, family_responsibility_leave_remaining,
            maternity_leave_taken, maternity_leave_remaining,
            popia_consent_date, handbook_acknowledged, code_of_conduct_acknowledged,
            health_safety_agreement_signed, performance_rating, last_review_date,
            next_review_date, review_notes,
            termination_date, termination_reason, notice_period_days,
            notice_given_date, final_pay_date, exit_interview_notes
        } = req.body;

        if (!username || !name || !surname || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if username exists
        db.get('SELECT id FROM employees WHERE username = ?', [username], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (user) return res.status(400).json({ error: 'Username already exists' });

            // Generate employee number
            generateEmployeeNumber(async (err, employeeNumber) => {
                if (err) return res.status(500).json({ error: err.message });

                let password_hash = '';
                if (password) {
                    const saltRounds = 10;
                    password_hash = await bcrypt.hash(password, saltRounds);
                }

                const query = `
                    INSERT INTO employees (
                        employee_number, username, password_hash, name, surname, date_of_birth, id_number,
                        gender, race, nationality, home_language, marital_status, dependents,
                        email, phone, phone_home, physical_address, postal_address,
                        emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
                        department, job_title, role, employment_type,
                        contract_start_date, contract_end_date, probation_days, probation_end_date,
                        working_hours_per_week, shift_schedule, salary_amount, salary_type,
                        bank_name, bank_account, bank_branch_code, tax_reference, uif_number,
                        pension_fund_number, medical_aid_number, access_rights, is_active,
                        annual_leave_taken, annual_leave_remaining, sick_leave_taken, sick_leave_remaining,
                        family_responsibility_leave_taken, family_responsibility_leave_remaining,
                        maternity_leave_taken, maternity_leave_remaining,
                        popia_consent_date, handbook_acknowledged, code_of_conduct_acknowledged,
                        health_safety_agreement_signed, performance_rating, last_review_date,
                        next_review_date, review_notes,
                        termination_date, termination_reason, notice_period_days,
                        notice_given_date, final_pay_date, exit_interview_notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    employeeNumber, username, password_hash, name, surname, date_of_birth, id_number,
                    gender, race, nationality, home_language, marital_status, dependents,
                    email, phone, phone_home, physical_address, postal_address,
                    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
                    department, job_title, role, employment_type,
                    contract_start_date, contract_end_date, probation_days, probation_end_date,
                    working_hours_per_week, shift_schedule, salary_amount, salary_type,
                    bank_name, bank_account, bank_branch_code, tax_reference, uif_number,
                    pension_fund_number, medical_aid_number, access_rights, is_active || 'active',
                    annual_leave_taken || 0, annual_leave_remaining || 15,
                    sick_leave_taken || 0, sick_leave_remaining || 30,
                    family_responsibility_leave_taken || 0, family_responsibility_leave_remaining || 3,
                    maternity_leave_taken || 0, maternity_leave_remaining || 120,
                    popia_consent_date, handbook_acknowledged || 0, code_of_conduct_acknowledged || 0,
                    health_safety_agreement_signed || 0, performance_rating || 0,
                    last_review_date, next_review_date, review_notes,
                    termination_date, termination_reason, notice_period_days || 30,
                    notice_given_date, final_pay_date, exit_interview_notes
                ];

                db.run(query, values, function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ 
                        success: true, 
                        id: this.lastID, 
                        employee_number: employeeNumber,
                        message: 'Employee added successfully' 
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update employee by employee_number
router.put('/:employeeNumber', async (req, res) => {
    const { employeeNumber } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    let fields = [];
    let values = [];
    
    Object.keys(updates).forEach(key => {
        if (key !== 'password' && key !== 'id' && key !== 'employee_number') {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }
    });
    
    // Handle password separately
    if (updates.password) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(updates.password, saltRounds);
        fields.push('password_hash = ?');
        values.push(password_hash);
    }
    
    values.push(employeeNumber);
    const query = `UPDATE employees SET ${fields.join(', ')} WHERE employee_number = ?`;
    
    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Employee updated successfully' });
    });
});

// DELETE employee by employee_number
router.delete('/:employeeNumber', (req, res) => {
    const { employeeNumber } = req.params;
    db.run(
        'UPDATE employees SET is_active = "inactive", termination_date = date("now") WHERE employee_number = ?',
        [employeeNumber],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Employee deactivated' });
        }
    );
});

module.exports = router;
