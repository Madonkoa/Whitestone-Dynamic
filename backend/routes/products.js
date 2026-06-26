// routes/products.js - Products API
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all products
router.get('/', (req, res) => {
    db.all('SELECT * FROM products ORDER BY name', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// GET a single product
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        res.json(row);
    });
});

// POST create a product
router.post('/', (req, res) => {
    const { name, category, description } = req.body;
    if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
    }
    db.run(
        'INSERT INTO products (name, category, description) VALUES (?, ?, ?)',
        [name, category, description || ''],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Product added' });
        }
    );
});

// PUT update a product
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, description } = req.body;
    db.run(
        'UPDATE products SET name = ?, category = ?, description = ? WHERE id = ?',
        [name, category, description || '', id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
            res.json({ success: true, message: 'Product updated' });
        }
    );
});

// DELETE a product
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
        res.json({ success: true, message: 'Product deleted' });
    });
});

module.exports = router;
