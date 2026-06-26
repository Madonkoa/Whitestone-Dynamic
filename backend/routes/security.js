// routes/security.js - Security CRUD
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, checkPermission } = require('../middleware/auth');

// Get all security incidents
router.get('/', verifyToken, checkPermission('security_view'), (req, res) => {
    db.all('SELECT * FROM security ORDER BY date_reported DESC', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single incident
router.get('/:id', verifyToken, checkPermission('security_view'), (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM security WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        res.json(row);
    });
});

// Report incident (everyone with security_view can report)
router.post('/', verifyToken, checkPermission('security_view'), (req, res) => {
    const { incident_type, description, resolved } = req.body;

    if (!incident_type || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO security (incident_type, description, resolved)
        VALUES (?, ?, ?)
    `;

    db.run(query, [incident_type, description, resolved || 0], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({
            success: true,
            id: this.lastID,
            message: 'Security incident reported successfully'
        });
    });
});

// Update incident (requires security_crud permission)
router.put('/:id', verifyToken, checkPermission('security_crud'), (req, res) => {
    const { id } = req.params;
    const { incident_type, description, resolved } = req.body;

    const query = `
        UPDATE security 
        SET incident_type = ?, description = ?, resolved = ?
        WHERE id = ?
    `;

    db.run(query, [incident_type, description, resolved, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        res.json({
            success: true,
            message: 'Security incident updated successfully'
        });
    });
});

// Delete incident (requires security_crud permission)
router.delete('/:id', verifyToken, checkPermission('security_crud'), (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM security WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }
        res.json({
            success: true,
            message: 'Security incident deleted successfully'
        });
    });
});

// Get security stats
router.get('/stats', verifyToken, checkPermission('security_view'), (req, res) => {
    db.get(`
        SELECT 
            COUNT(*) as total_incidents,
            COUNT(CASE WHEN resolved = 1 THEN 1 END) as resolved_count,
            COUNT(CASE WHEN resolved = 0 THEN 1 END) as pending_count,
            COUNT(CASE WHEN incident_type = 'Theft' THEN 1 END) as theft_count,
            COUNT(CASE WHEN incident_type = 'Predator Attack' THEN 1 END) as predator_count,
            COUNT(CASE WHEN incident_type = 'Vandalism' THEN 1 END) as vandalism_count,
            COUNT(CASE WHEN incident_type = 'Trespassing' THEN 1 END) as trespassing_count,
            COUNT(CASE WHEN incident_type = 'Equipment Damage' THEN 1 END) as equipment_damage_count
        FROM security
    `, (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row || {});
    });
});

module.exports = router;