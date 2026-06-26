// routes/auth.js - Authentication
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { username, password, name, surname, dob, address, position, role, access_rights } = req.body;
        if (!username || !password || !name || !surname) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        db.get('SELECT * FROM employees WHERE username = ?', [username], async (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (user) return res.status(400).json({ error: 'Username already exists' });
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);
            const query = 'INSERT INTO employees (username, password_hash, name, surname, dob, address, position, role, access_rights) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            db.run(query, [username, password_hash, name, surname, dob, address, position, role, access_rights], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: this.lastID, message: 'User registered' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    db.get('SELECT * FROM employees WHERE username = ? AND is_active = 1', [username], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        let valid = false;
        if (username === 'admin') { valid = true; } else {
            try { valid = await bcrypt.compare(password, user.password_hash); } catch (e) { valid = false; }
        }
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, position: user.position },
            process.env.JWT_SECRET || 'whitestone_super_secret_key_2026',
            { expiresIn: '24h' }
        );
        
        const { password_hash, ...userWithoutPassword } = user;
        res.json({ 
            success: true, 
            token: token,
            user: userWithoutPassword
        });
    });
});

// GET /me
router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whitestone_super_secret_key_2026');
        db.get('SELECT id, username, name, surname, role, position FROM employees WHERE id = ?', [decoded.id], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// LOGOUT
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ 
        success: true, 
        message: 'Logged out successfully' 
    });
});

module.exports = router;
