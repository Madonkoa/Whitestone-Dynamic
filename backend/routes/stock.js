// routes/stock.js - Stock CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all stock
router.get('/', verifyToken, checkPermission('stock_view'), (req, res) => {
    db.all('SELECT * FROM stock', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add stock item
router.post('/', verifyToken, checkPermission('stock_crud'), (req, res) => {
    const { item_type, quantity, unit, price } = req.body;

    if (!item_type || quantity === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO stock (item_type, quantity, unit, price, last_updated)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    db.run(query, [item_type, quantity, unit, price || 0], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            id: this.lastID,
            message: 'Stock item added successfully'
        });
    });
});

// Update stock item
router.put('/:id', verifyToken, checkPermission('stock_crud'), (req, res) => {
    const { id } = req.params;
    const { item_type, quantity, unit, price } = req.body;

    const query = `
        UPDATE stock 
        SET item_type = ?, quantity = ?, unit = ?, price = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(query, [item_type, quantity, unit, price, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Stock item not found' });
        }
        res.json({
            success: true,
            message: 'Stock item updated successfully'
        });
    });
});

// Delete stock item
router.delete('/:id', verifyToken, checkPermission('stock_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM stock WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Stock item not found' });
        }
        res.json({
            success: true,
            message: 'Stock item deleted successfully'
        });
    });
});

module.exports = router;