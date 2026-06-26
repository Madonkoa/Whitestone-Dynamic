// routes/pricing.js - Pricing CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get current pricing
router.get('/', verifyToken, checkPermission('pricing_view'), (req, res) => {
    db.get('SELECT * FROM pricing ORDER BY id DESC LIMIT 1', (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            // Create default pricing if none exists
            db.run(`
                INSERT INTO pricing (egg_tray, egg_piece, dressed_chicken, undressed_chicken)
                VALUES (120.00, 2.00, 90.00, 85.00)
            `, function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                db.get('SELECT * FROM pricing WHERE id = ?', [this.lastID], (err, newRow) => {
                    res.json(newRow);
                });
            });
        } else {
            res.json(row);
        }
    });
});

// Update pricing (requires pricing_crud permission)
router.put('/', verifyToken, checkPermission('pricing_crud'), (req, res) => {
    const { egg_tray, egg_piece, dressed_chicken, undressed_chicken } = req.body;

    if (egg_tray === undefined || egg_piece === undefined || dressed_chicken === undefined || undressed_chicken === undefined) {
        return res.status(400).json({ error: 'All pricing fields are required' });
    }

    // Get current pricing for history
    db.get('SELECT * FROM pricing ORDER BY id DESC LIMIT 1', (err, current) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Update pricing
        db.run(`
            UPDATE pricing SET egg_tray = ?, egg_piece = ?, dressed_chicken = ?, undressed_chicken = ?, last_updated = CURRENT_TIMESTAMP
        `, [egg_tray, egg_piece, dressed_chicken, undressed_chicken], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Save to history
            if (current) {
                db.run(`
                    INSERT INTO pricing_history (egg_tray, egg_piece, dressed_chicken, undressed_chicken, last_updated)
                    VALUES (?, ?, ?, ?, ?)
                `, [current.egg_tray, current.egg_piece, current.dressed_chicken, current.undressed_chicken, current.last_updated]);
            }

            db.get('SELECT * FROM pricing ORDER BY id DESC LIMIT 1', (err, row) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({
                    success: true,
                    pricing: row,
                    message: 'Pricing updated successfully'
                });
            });
        });
    });
});

// Get pricing history
router.get('/history', verifyToken, checkPermission('pricing_view'), (req, res) => {
    db.all('SELECT * FROM pricing_history ORDER BY last_updated DESC LIMIT 50', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;