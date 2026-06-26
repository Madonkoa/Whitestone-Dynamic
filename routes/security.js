// routes/security.js - Security Logs
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/logs', (req, res) => {
    db.all('SELECT * FROM security_logs ORDER BY timestamp DESC LIMIT 100', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.post('/logs', (req, res) => {
    const { user_id, action, details, ip_address } = req.body;
    if (!action) return res.status(400).json({ error: 'Action is required' });
    const query = 'INSERT INTO security_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)';
    db.run(query, [user_id || null, action, details || '', ip_address || ''], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, message: 'Log recorded' });
    });
});

module.exports = router;
