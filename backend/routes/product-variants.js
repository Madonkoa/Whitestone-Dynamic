// routes/product-variants.js - Product Variants API
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET all variants
router.get('/', (req, res) => {
    db.all(
        SELECT pv.*, p.name as product_name, p.category as category 
         FROM product_variants pv 
         LEFT JOIN products p ON pv.product_id = p.id 
         ORDER BY p.name, pv.variant_name,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        }
    );
});

// GET variants for a specific product
router.get('/product/:productId', (req, res) => {
    const { productId } = req.params;
    db.all(
        'SELECT * FROM product_variants WHERE product_id = ? ORDER BY variant_name',
        [productId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        }
    );
});

// POST create a variant
router.post('/', (req, res) => {
    const { product_id, variant_name, supplier, unit, quantity, price, threshold, expiry_date } = req.body;
    
    if (!product_id || !variant_name || !unit || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.run(
        INSERT INTO product_variants 
         (product_id, variant_name, supplier, unit, quantity, price, threshold, expiry_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?),
        [product_id, variant_name, supplier || null, unit, quantity, price || 0, threshold || 10, expiry_date || null],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Variant added' });
        }
    );
});

// PUT update a variant
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { product_id, variant_name, supplier, unit, quantity, price, threshold, expiry_date } = req.body;
    
    db.run(
        UPDATE product_variants SET 
         product_id = ?, variant_name = ?, supplier = ?, unit = ?, quantity = ?, price = ?, threshold = ?, expiry_date = ? 
         WHERE id = ?,
        [product_id, variant_name, supplier || null, unit, quantity, price || 0, threshold || 10, expiry_date || null, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Variant not found' });
            res.json({ success: true, message: 'Variant updated' });
        }
    );
});

// DELETE a variant
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM product_variants WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Variant not found' });
        res.json({ success: true, message: 'Variant deleted' });
    });
});

module.exports = router;
