// routes/eggs.js - Egg Production
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM egg_production ORDER BY date DESC LIMIT 100', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.post('/', (req, res) => {
    const { date, batch_id, small_eggs, medium_eggs, large_eggs, xl_eggs, total, notes } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });
    const query = 'INSERT INTO egg_production (date, batch_id, small_eggs, medium_eggs, large_eggs, xl_eggs, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(query, [date, batch_id || 1, small_eggs || 0, medium_eggs || 0, large_eggs || 0, xl_eggs || 0, total || 0, notes], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, message: 'Production recorded' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { date, batch_id, small_eggs, medium_eggs, large_eggs, xl_eggs, total, notes } = req.body;
    const query = 'UPDATE egg_production SET date = ?, batch_id = ?, small_eggs = ?, medium_eggs = ?, large_eggs = ?, xl_eggs = ?, total = ?, notes = ? WHERE id = ?';
    db.run(query, [date, batch_id, small_eggs, medium_eggs, large_eggs, xl_eggs, total, notes, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Record not found' });
        res.json({ success: true, message: 'Production updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM egg_production WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Record not found' });
        res.json({ success: true, message: 'Production deleted' });
    });
});

router.get('/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    db.get('SELECT SUM(total) as today_total FROM egg_production WHERE date = ?', [today], (err, todayRow) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT AVG(total) as avg_total FROM (SELECT total FROM egg_production WHERE date >= date("now", "-7 days") ORDER BY date DESC LIMIT 7)', (err, avgRow) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ today: todayRow ? todayRow.today_total || 0 : 0, average: avgRow ? Math.round(avgRow.avg_total || 0) : 0 });
        });
    });
});

module.exports = router;
