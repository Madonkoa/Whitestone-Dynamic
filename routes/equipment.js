// routes/equipment.js - Equipment CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM equipment ORDER BY name', (err, rows) => {
        if (err) {
            console.error('Equipment error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.post('/', (req, res) => {
    const { name, type, quantity, condition, maintenance_schedule, notes } = req.body;
    if (!name || !type) {
        return res.status(400).json({ error: 'Missing required fields: name and type are required' });
    }
    const query = 'INSERT INTO equipment (name, type, quantity, condition, maintenance_schedule, notes) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(query, [name, type, quantity || 0, condition || 'Good', maintenance_schedule || '', notes || ''], function(err) {
        if (err) {
            console.error('Insert error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Equipment added' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, type, quantity, condition, maintenance_schedule, notes } = req.body;
    const query = 'UPDATE equipment SET name = ?, type = ?, quantity = ?, condition = ?, maintenance_schedule = ?, notes = ? WHERE id = ?';
    db.run(query, [name, type, quantity, condition, maintenance_schedule, notes, id], function(err) {
        if (err) {
            console.error('Update error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Equipment not found' });
        res.json({ success: true, message: 'Equipment updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM equipment WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Delete error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Equipment not found' });
        res.json({ success: true, message: 'Equipment deleted' });
    });
});

module.exports = router;
