// routes/chickens.js - Chicken CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM chickens ORDER BY added_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

router.post('/', (req, res) => {
    const { type, batch, quantity, age, health, ready_for_sale, egg_production } = req.body;
    if (!type || !batch || !quantity) return res.status(400).json({ error: 'Missing required fields' });
    const query = 'INSERT INTO chickens (type, batch, quantity, age, health, ready_for_sale, egg_production) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.run(query, [type, batch, quantity, age || 0, health || 'Good', ready_for_sale || 0, egg_production || 0], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID, message: 'Chickens added' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { type, batch, quantity, age, health, ready_for_sale, egg_production, sold } = req.body;
    const query = 'UPDATE chickens SET type = ?, batch = ?, quantity = ?, age = ?, health = ?, ready_for_sale = ?, egg_production = ?, sold = ? WHERE id = ?';
    db.run(query, [type, batch, quantity, age, health, ready_for_sale, egg_production, sold, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Chickens not found' });
        res.json({ success: true, message: 'Chickens updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM chickens WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Chickens not found' });
        res.json({ success: true, message: 'Chickens deleted' });
    });
});

module.exports = router;
