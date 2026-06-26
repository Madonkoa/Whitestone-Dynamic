// routes/pricing.js - Pricing CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', (req, res) => {
    db.all('SELECT * FROM pricing ORDER BY updated_at DESC', (err, rows) => {
        if (err) {
            console.error('Pricing error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows || []);
    });
});

router.get('/current', (req, res) => {
    db.get('SELECT * FROM pricing WHERE is_current = 1 ORDER BY updated_at DESC LIMIT 1', (err, row) => {
        if (err) {
            console.error('Pricing current error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(row || {});
    });
});

router.post('/', (req, res) => {
    const { product_type, price_per_unit, size, description } = req.body;
    if (!product_type || price_per_unit === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const query = 'INSERT INTO pricing (product_type, price_per_unit, size, description, is_current) VALUES (?, ?, ?, ?, 1)';
    db.run(query, [product_type, price_per_unit, size || 'standard', description || ''], function(err) {
        if (err) {
            console.error('Pricing insert error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        db.run('UPDATE pricing SET is_current = 0 WHERE id != ? AND product_type = ?', [this.lastID, product_type], function(err) {
            if (err) {
                console.error('Pricing update error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: this.lastID, message: 'Price added' });
        });
    });
});

router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { product_type, price_per_unit, size, description, is_current } = req.body;
    const query = 'UPDATE pricing SET product_type = ?, price_per_unit = ?, size = ?, description = ?, is_current = ? WHERE id = ?';
    db.run(query, [product_type, price_per_unit, size, description, is_current || 0, id], function(err) {
        if (err) {
            console.error('Pricing update error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Price not found' });
        res.json({ success: true, message: 'Price updated' });
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM pricing WHERE id = ?', [id], function(err) {
        if (err) {
            console.error('Pricing delete error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Price not found' });
        res.json({ success: true, message: 'Price deleted' });
    });
});

module.exports = router;
