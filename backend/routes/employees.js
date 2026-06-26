// routes/employees.js - Employee CRUD
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all employees (requires employees_view permission)
router.get('/', verifyToken, checkPermission('employees_view'), (req, res) => {
    db.all('SELECT id, username, name, surname, dob, address, position, role, access_rights, is_active, created_at FROM employees', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single employee
router.get('/:id', verifyToken, checkPermission('employees_view'), (req, res) => {
    const { id } = req.params;
    db.get('SELECT id, username, name, surname, dob, address, position, role, access_rights, is_active, created_at FROM employees WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(row);
    });
});

// Add employee (requires employees_crud permission)
router.post('/', verifyToken, checkPermission('employees_crud'), async (req, res) => {
    try {
        const { username, password, name, surname, dob, address, position, role, access_rights } = req.body;

        if (!username || !password || !name || !surname) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        db.get('SELECT * FROM employees WHERE username = ?', [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (user) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            const query = `
                INSERT INTO employees 
                (username, password_hash, name, surname, dob, address, position, role, access_rights)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(query, [username, password_hash, name, surname, dob, address, position, role, access_rights], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    success: true,
                    id: this.lastID,
                    message: 'Employee added successfully'
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update employee (requires employees_crud permission)
router.put('/:id', verifyToken, checkPermission('employees_crud'), async (req, res) => {
    try {
        const { id } = req.params;
        const { username, name, surname, dob, address, position, role, access_rights, is_active } = req.body;

        const query = `
            UPDATE employees 
            SET username = ?, name = ?, surname = ?, dob = ?, address = ?, position = ?, role = ?, access_rights = ?, is_active = ?
            WHERE id = ?
        `;

        db.run(query, [username, name, surname, dob, address, position, role, access_rights, is_active, id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Employee not found' });
            }
            res.json({
                success: true,
                message: 'Employee updated successfully'
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete employee (requires employees_crud permission)
router.delete('/:id', verifyToken, checkPermission('employees_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM employees WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    });
});

module.exports = router;