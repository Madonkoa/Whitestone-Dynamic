// routes/batches.js - Batch CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all batches
router.get('/', verifyToken, checkPermission('batches_view'), (req, res) => {
    db.all('SELECT * FROM batches ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single batch
router.get('/:id', verifyToken, checkPermission('batches_view'), (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM batches WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        res.json(row);
    });
});

// Add batch
router.post('/', verifyToken, checkPermission('batches_crud'), (req, res) => {
    const { batch_number, type, quantity, age, status, start_date, notes } = req.body;

    if (!batch_number || !type || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if batch number exists
    db.get('SELECT * FROM batches WHERE batch_number = ?', [batch_number], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'Batch number already exists' });
        }

        const query = `
            INSERT INTO batches (batch_number, type, quantity, age, status, start_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(query, [batch_number, type, quantity, age || 0, status || 'Active', start_date, notes], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                success: true,
                id: this.lastID,
                message: 'Batch added successfully'
            });
        });
    });
});

// Update batch
router.put('/:id', verifyToken, checkPermission('batches_crud'), (req, res) => {
    const { id } = req.params;
    const { batch_number, type, quantity, age, status, start_date, notes } = req.body;

    const query = `
        UPDATE batches 
        SET batch_number = ?, type = ?, quantity = ?, age = ?, status = ?, start_date = ?, notes = ?
        WHERE id = ?
    `;

    db.run(query, [batch_number, type, quantity, age, status, start_date, notes, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        res.json({
            success: true,
            message: 'Batch updated successfully'
        });
    });
});

// Delete batch
router.delete('/:id', verifyToken, checkPermission('batches_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM batches WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        res.json({
            success: true,
            message: 'Batch deleted successfully'
        });
    });
});

// Get batch stats
router.get('/stats', verifyToken, checkPermission('batches_view'), (req, res) => {
    db.get(`
        SELECT 
            COUNT(*) as total_batches,
            COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_batches,
            COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_batches,
            SUM(quantity) as total_birds
        FROM batches
    `, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row || {});
    });
});

module.exports = router;