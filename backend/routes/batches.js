// routes/batches.js - Complete Batch Management
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ===== GET ALL BATCHES =====
router.get('/', (req, res) => {
    db.all('SELECT * FROM batches ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// ===== GET SINGLE BATCH =====
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM batches WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Batch not found' });
        res.json(row);
    });
});

// ===== CREATE BATCH =====
router.post('/', (req, res) => {
    const { batch_number, type, quantity, age, status, start_date, cost, revenue, feed_used, mortality, avg_weight, health_status, notes } = req.body;
    
    if (!batch_number || !type || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    db.get('SELECT * FROM batches WHERE batch_number = ?', [batch_number], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: 'Batch number already exists' });
        
        const query = `INSERT INTO batches (batch_number, type, quantity, age, status, start_date, cost, revenue, feed_used, mortality, avg_weight, health_status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(query, [
            batch_number, type, quantity, age || 0, status || 'Active', start_date || null,
            cost || 0, revenue || 0, feed_used || 0, mortality || 0, avg_weight || 0, health_status || 'Good', notes || ''
        ], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID, message: 'Batch added' });
        });
    });
});

// ===== UPDATE BATCH =====
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { batch_number, type, quantity, age, status, start_date, cost, revenue, feed_used, mortality, avg_weight, health_status, notes } = req.body;
    
    const query = `UPDATE batches SET batch_number = ?, type = ?, quantity = ?, age = ?, status = ?, start_date = ?, cost = ?, revenue = ?, feed_used = ?, mortality = ?, avg_weight = ?, health_status = ?, notes = ? WHERE id = ?`;
    
    db.run(query, [
        batch_number, type, quantity, age || 0, status || 'Active', start_date || null,
        cost || 0, revenue || 0, feed_used || 0, mortality || 0, avg_weight || 0, health_status || 'Good', notes || '',
        id
    ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Batch not found' });
        res.json({ success: true, message: 'Batch updated' });
    });
});

// ===== DELETE BATCH =====
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM batches WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Batch not found' });
        res.json({ success: true, message: 'Batch deleted' });
    });
});

// ===== GET BATCH HISTORY =====
router.get('/:id/history', (req, res) => {
    const { id } = req.params;
    db.all('SELECT * FROM batch_history WHERE batch_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// ===== RECORD WEIGHT =====
router.post('/:id/weight', (req, res) => {
    const { id } = req.params;
    const { weight, notes } = req.body;
    if (!weight) return res.status(400).json({ error: 'Weight is required' });
    
    db.get('SELECT * FROM batches WHERE id = ?', [id], (err, batch) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        
        db.run('UPDATE batches SET avg_weight = ? WHERE id = ?', [weight, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run('INSERT INTO batch_history (batch_id, update_type, field_name, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [id, 'weight_update', 'avg_weight', String(batch.avg_weight || 0), String(weight), notes || 'Weight recorded']);
            res.json({ success: true, message: 'Weight recorded' });
        });
    });
});

// ===== RECORD MORTALITY =====
router.post('/:id/mortality', (req, res) => {
    const { id } = req.params;
    const { count, reason } = req.body;
    if (!count) return res.status(400).json({ error: 'Count is required' });
    
    db.get('SELECT quantity, mortality FROM batches WHERE id = ?', [id], (err, batch) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        
        const newMortality = (batch.mortality || 0) + parseInt(count);
        const newQuantity = (batch.quantity || 0) - parseInt(count);
        if (newQuantity < 0) return res.status(400).json({ error: 'Cannot remove more birds than exist' });
        
        db.run('UPDATE batches SET mortality = ?, quantity = ? WHERE id = ?', [newMortality, newQuantity, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run('INSERT INTO batch_history (batch_id, update_type, field_name, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [id, 'mortality_update', 'mortality', String(batch.mortality || 0), String(newMortality), reason || 'Mortality recorded']);
            res.json({ success: true, message: 'Mortality recorded', newMortality: newMortality, newQuantity: newQuantity });
        });
    });
});

// ===== UPDATE HEALTH =====
router.put('/:id/health', (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    
    db.get('SELECT health_status FROM batches WHERE id = ?', [id], (err, batch) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!batch) return res.status(404).json({ error: 'Batch not found' });
        
        db.run('UPDATE batches SET health_status = ? WHERE id = ?', [status, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run('INSERT INTO batch_history (batch_id, update_type, field_name, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [id, 'health_update', 'health_status', batch.health_status || 'Good', status, notes || 'Health status changed']);
            res.json({ success: true, message: 'Health status updated' });
        });
    });
});

module.exports = router;

