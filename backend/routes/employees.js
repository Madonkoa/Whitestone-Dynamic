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

// POST verify current password
router.post('/:employeeNumber/verify-password', async (req, res) => {
    const { employeeNumber } = req.params;
    const { currentPassword } = req.body;
    
    if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
    }
    
    try {
        db.get('SELECT password_hash FROM employees WHERE employee_number = ?', [employeeNumber], async (err, employee) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!employee) return res.status(404).json({ error: 'Employee not found' });
            
            const valid = await bcrypt.compare(currentPassword, employee.password_hash);
            res.json({ valid: valid });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// POST reset password
router.post('/:employeeNumber/reset-password', async (req, res) => {
    const { employeeNumber } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    console.log('RESET PASSWORD REQUEST for:', employeeNumber);
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    try {
        db.get('SELECT * FROM employees WHERE employee_number = ?', [employeeNumber], async (err, employee) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            if (!employee) {
                console.log('Employee not found:', employeeNumber);
                return res.status(404).json({ error: 'Employee not found' });
            }
            
            console.log('Employee found:', employee.username);
            
            const validPassword = await bcrypt.compare(currentPassword, employee.password_hash);
            console.log('Password valid:', validPassword);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
            
            db.run(
                'UPDATE employees SET password_hash = ? WHERE employee_number = ?',
                [newPasswordHash, employeeNumber],
                function(err) {
                    if (err) {
                        console.error('Update error:', err.message);
                        return res.status(500).json({ error: err.message });
                    }
                    console.log('Password updated successfully for:', employeeNumber);
                    res.json({ success: true, message: 'Password updated successfully' });
                }
            );
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;







