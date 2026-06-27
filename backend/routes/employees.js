// routes/employees.js - Complete employee routes
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

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

router.get('/', (req, res) => {
    db.all('SELECT * FROM employees ORDER BY id', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.get('/:employeeNumber', (req, res) => {
    const { employeeNumber } = req.params;
    db.get('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber], (err, employee) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    });
});

router.post('/', async (req, res) => {
    try {
        const { username, password, name, surname, role, email, phone, is_active, department } = req.body;

        if (!username || !name || !surname || !role) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        db.get('SELECT id FROM employees WHERE username = ?', [username], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (user) return res.status(400).json({ error: 'Username already exists' });

            generateEmployeeNumber(async (err, employeeNumber) => {
                if (err) return res.status(500).json({ error: err.message });

                let password_hash = '';
                if (password) {
                    const saltRounds = 10;
                    password_hash = await bcrypt.hash(password, saltRounds);
                }

                const query = `
                    INSERT INTO employees (
                        employee_number, username, password_hash, name, surname,
                        role, email, phone, is_active, department
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    employeeNumber, username, password_hash, name, surname,
                    role, email || '', phone || '', is_active || 'active', department || ''
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

router.put('/:employeeNumber', async (req, res) => {
    const { employeeNumber } = req.params;
    const updates = req.body;
    
    let fields = [];
    let values = [];
    
    Object.keys(updates).forEach(key => {
        if (key !== 'password' && key !== 'id' && key !== 'employee_number') {
            fields.push(key + ' = ?');
            values.push(updates[key]);
        }
    });
    
    if (updates.password) {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(updates.password, saltRounds);
        fields.push('password_hash = ?');
        values.push(password_hash);
    }
    
    values.push(employeeNumber);
    const query = 'UPDATE employees SET ' + fields.join(', ') + ' WHERE employee_number = ?';
    
    db.run(query, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Employee updated successfully' });
    });
});

router.post('/:employeeNumber/reset-password', async (req, res) => {
    const { employeeNumber } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    try {
        db.get('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber], async (err, employee) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!employee) return res.status(404).json({ error: 'Employee not found' });

            const validPassword = await bcrypt.compare(currentPassword, employee.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            db.run(
                'UPDATE employees SET password_hash = ? WHERE employee_number = ?',
                [newPasswordHash, employeeNumber],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ success: true, message: 'Password reset successfully' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:employeeNumber', (req, res) => {
    const { employeeNumber } = req.params;
    db.run(
        'UPDATE employees SET is_active = "inactive" WHERE employee_number = ?',
        [employeeNumber],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: 'Employee archived' });
        }
    );
});

module.exports = router;
