// routes/feed.js - Feed CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all feed
router.get('/', verifyToken, checkPermission('feed_view'), (req, res) => {
    db.all('SELECT * FROM feed', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add feed
router.post('/', verifyToken, checkPermission('feed_crud'), (req, res) => {
    const { feed_type, quantity_kg } = req.body;

    if (!feed_type || quantity_kg === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO feed (feed_type, quantity_kg, last_updated)
        VALUES (?, ?, CURRENT_TIMESTAMP)
    `;

    db.run(query, [feed_type, quantity_kg], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            id: this.lastID,
            message: 'Feed added successfully'
        });
    });
});

// Update feed
router.put('/:id', verifyToken, checkPermission('feed_crud'), (req, res) => {
    const { id } = req.params;
    const { feed_type, quantity_kg } = req.body;

    const query = `
        UPDATE feed 
        SET feed_type = ?, quantity_kg = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(query, [feed_type, quantity_kg, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Feed not found' });
        }
        res.json({
            success: true,
            message: 'Feed updated successfully'
        });
    });
});

// Record feed consumption
router.post('/consumption', verifyToken, checkPermission('feed_crud'), (req, res) => {
    const { feed_type, date, bags, bag_size, total_kg, condition } = req.body;

    if (!feed_type || !date || bags === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO feed_consumption (feed_type, date, bags, bag_size, total_kg, condition)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [feed_type, date, bags, bag_size || 50, total_kg || bags * 50, condition], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            id: this.lastID,
            message: 'Feed consumption recorded successfully'
        });
    });
});

// Get feed consumption history
router.get('/consumption', verifyToken, checkPermission('feed_view'), (req, res) => {
    db.all('SELECT * FROM feed_consumption ORDER BY date DESC LIMIT 50', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Record feed stock
router.post('/stock', verifyToken, checkPermission('feed_crud'), (req, res) => {
    const { feed_type, date, bags, bag_size, total_kg, total_cost, supplier } = req.body;

    if (!feed_type || !date || bags === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO feed_stock_records (feed_type, date, bags, bag_size, total_kg, total_cost, supplier)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [feed_type, date, bags, bag_size || 50, total_kg || bags * 50, total_cost || 0, supplier], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            id: this.lastID,
            message: 'Feed stock recorded successfully'
        });
    });
});

// Get feed stock records
router.get('/stock', verifyToken, checkPermission('feed_view'), (req, res) => {
    db.all('SELECT * FROM feed_stock_records ORDER BY date DESC LIMIT 50', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Delete feed
router.delete('/:id', verifyToken, checkPermission('feed_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM feed WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Feed not found' });
        }
        res.json({
            success: true,
            message: 'Feed deleted successfully'
        });
    });
});

module.exports = router;