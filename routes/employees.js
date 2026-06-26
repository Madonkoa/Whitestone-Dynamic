// routes/employees.js - Employee CRUD (Auth handled globally)
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

// All routes now protected by global auth middleware

router.get('/', (req, res) => {
    db.all('SELECT id, username, name, surname, position, role, is_active FROM employees', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.post('/', async (req, res) => {
    try {
        const { username, password, name, surname, dob, address, position, role, access_rights } = req.body;
        if (!username || !name || !surname) return res.status(400).json({ error: 'Missing required fields' });
        db.get('SELECT * FROM employees WHERE username = ?', [username], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (user) return res.status(400).json({ error: 'Username already exists' });
            let password_hash = '';
            if (password) { const saltRounds = 10; password_hash = await bcrypt.hash(password, saltRounds); }
            const query = 'INSERT INTO employees (username, password_hash, name, surname, dob, address, position, role, access_rights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            db.run(query, [username, password_hash, name, surname, dob, address, position, role, access_rights], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID, message: 'Employee added' });
            });
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { username, name, surname, dob, address, position, role, access_rights, is_active } = req.body;
    const query = 'UPDATE employees SET username = ?, name = ?, surname = ?, dob = ?, address = ?, position = ?, role = ?, access_rights = ?, is_active = ? WHERE id = ?';
    db.run(query, [username, name, surname, dob, address, position, role, access_rights, is_active, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, message: 'Employee updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM employees WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Employee not found' });
        res.json({ success: true, message: 'Employee deleted' });
    });
});

module.exports = router;
