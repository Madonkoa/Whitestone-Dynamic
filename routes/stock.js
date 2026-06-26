// routes/stock.js - Stock CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM stock', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.post('/', (req, res) => {
    const { item_type, quantity, unit, price } = req.body;
    
    if (!item_type || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = 
        INSERT INTO stock (item_type, quantity, unit, price)
        VALUES (?, ?, ?, ?)
    ;
    
    db.run(query, [item_type, quantity, unit, price || 0], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID, message: 'Stock added' });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { item_type, quantity, unit, price } = req.body;
    
    const query = 
        UPDATE stock 
        SET item_type = ?, quantity = ?, unit = ?, price = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    ;
    
    db.run(query, [item_type, quantity, unit, price, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.json({ success: true, message: 'Stock updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM stock WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.json({ success: true, message: 'Stock deleted' });
    });
});

module.exports = router;
