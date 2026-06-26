// routes/equipment.js - Equipment CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all equipment
router.get('/', verifyToken, checkPermission('equipment_view'), (req, res) => {
    db.all('SELECT * FROM equipment ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single equipment
router.get('/:id', verifyToken, checkPermission('equipment_view'), (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM equipment WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json(row);
    });
});

// Add equipment
router.post('/', verifyToken, checkPermission('equipment_crud'), (req, res) => {
    const { name, condition, purchase_date, last_maintenance, notes } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const query = `
        INSERT INTO equipment (name, condition, purchase_date, last_maintenance, notes)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [name, condition || 'Good', purchase_date, last_maintenance, notes], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            id: this.lastID,
            message: 'Equipment added successfully'
        });
    });
});

// Update equipment
router.put('/:id', verifyToken, checkPermission('equipment_crud'), (req, res) => {
    const { id } = req.params;
    const { name, condition, purchase_date, last_maintenance, notes } = req.body;

    const query = `
        UPDATE equipment 
        SET name = ?, condition = ?, purchase_date = ?, last_maintenance = ?, notes = ?
        WHERE id = ?
    `;

    db.run(query, [name, condition, purchase_date, last_maintenance, notes, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json({
            success: true,
            message: 'Equipment updated successfully'
        });
    });
});

// Delete equipment
router.delete('/:id', verifyToken, checkPermission('equipment_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM equipment WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Equipment not found' });
        }
        res.json({
            success: true,
            message: 'Equipment deleted successfully'
        });
    });
});

module.exports = router;