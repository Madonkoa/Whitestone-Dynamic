// routes/coops.js - Coop CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all coops
router.get('/', verifyToken, checkPermission('coops_view'), (req, res) => {
    db.all('SELECT * FROM coops ORDER BY coop_number, zone_letter', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add coop zone
router.post('/', verifyToken, checkPermission('coops_crud'), (req, res) => {
    const { coop_number, zone_letter, current_stock, health_status, notes } = req.body;

    if (!coop_number || !zone_letter) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if zone exists
    db.get('SELECT * FROM coops WHERE coop_number = ? AND zone_letter = ?', [coop_number, zone_letter], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            return res.status(400).json({ error: 'Coop zone already exists' });
        }

        const query = `
            INSERT INTO coops (coop_number, zone_letter, current_stock, health_status, notes)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.run(query, [coop_number, zone_letter, current_stock || 0, health_status || 'Good', notes], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({
                success: true,
                id: this.lastID,
                message: 'Coop zone added successfully'
            });
        });
    });
});

// Update coop zone
router.put('/:id', verifyToken, checkPermission('coops_crud'), (req, res) => {
    const { id } = req.params;
    const { coop_number, zone_letter, current_stock, health_status, notes } = req.body;

    const query = `
        UPDATE coops 
        SET coop_number = ?, zone_letter = ?, current_stock = ?, health_status = ?, notes = ?, last_checked = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(query, [coop_number, zone_letter, current_stock, health_status, notes, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Coop zone not found' });
        }
        res.json({
            success: true,
            message: 'Coop zone updated successfully'
        });
    });
});

// Delete coop zone
router.delete('/:id', verifyToken, checkPermission('coops_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM coops WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Coop zone not found' });
        }
        res.json({
            success: true,
            message: 'Coop zone deleted successfully'
        });
    });
});

module.exports = router;